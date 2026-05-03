import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { NoteStatus } from '../../types/enums';
import { buildTranscriptText } from '../transcription/transcription.service';
import { extractFromSOAPNote } from '../ehr-extractions/ehr-extractions.service';
import { logger } from '../../utils/logger';
import { sendSoapNoteToRecords } from '../../services/email.service';
import { logCorrection, isMeaningfulChange } from '../../services/corrections.service';
import { getTemplate } from '../../data/note-templates';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const SOAPResponseSchema = z.object({
  subjective: z.string().min(1),
  objective: z.string().min(1),
  assessment: z.string().min(1),
  plan: z.string().min(1),
});

const SYSTEM_PROMPT = `You are a clinical documentation assistant for Nigerian hospitals.
Your task is to convert a doctor-patient consultation transcript into a structured SOAP note.

SOAP Note Format:
- Subjective: Patient's reported complaints, symptoms, and history (paraphrased clinically from what the patient said).
- Objective: Observable findings — vitals, physical exam results, test results, visible signs mentioned in conversation.
- Assessment: Clinical interpretation — working diagnosis or differential diagnoses based on the consultation.
- Plan: Treatment plan — medications, investigations, referrals, follow-up, lifestyle advice.

Rules:
1. Extract maximum value from the transcript. Even brief exchanges contain clinical signal — the chief complaint, why the patient came, how they feel, what the doctor decided.
2. Use proper medical terminology but stay faithful to what was actually said.
3. **Never output "Not documented" or similar placeholder text.** If a section has limited data, write a brief clinically valid statement that reflects reality. Examples:
   - Subjective with limited data: "Patient presented today without a detailed history captured in this encounter. Chief concern referenced in session: [whatever brief detail exists]."
   - Objective with no exam findings: "No formal physical examination findings were recorded during this encounter." OR infer from context if any vitals/observations were mentioned.
   - Assessment with uncertainty: "Working impression based on available information: [best interpretation]. Further evaluation may be warranted."
   - Plan with limited data: Extract any medications, advice, or follow-up mentioned. If truly nothing, write "Plan to be finalized by the treating clinician after further evaluation."
4. When previous visit history is provided, reference it to show continuity of care where relevant.
5. If the transcript is very short, still produce a coherent note using whatever clinical signal exists — never leave a section empty or placeholder.
6. Respond ONLY with a valid JSON object — no markdown, no explanation.

JSON format:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "..."
}`;

const checkDrugInteractions = async (plan: string): Promise<string[]> => {
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 512,
      system: 'You are a clinical pharmacist. Given a treatment plan, identify potential drug-drug interactions or significant drug-allergy concerns a prescribing doctor should be aware of. Respond ONLY with a valid JSON array of short warning strings (each under 120 characters). If there are no notable interactions, return []. No markdown, no explanation.',
      messages: [{ role: 'user', content: `Review this treatment plan for drug interactions:\n${plan}` }],
    });
    const content = response.content[0];
    if (content.type !== 'text') return [];
    const raw = content.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const result = JSON.parse(raw);
    return Array.isArray(result) ? result.slice(0, 5) : [];
  } catch {
    return [];
  }
};

export const generateSOAPNote = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    include: {
      transcriptions: { orderBy: { startMs: 'asc' } },
      patient: { select: { id: true, firstName: true, lastName: true, allergies: true, chronicConditions: true } },
    },
  });

  if (!session) throw new AppError('Session not found', 404);

  const existing = await prisma.sOAPNote.findUnique({ where: { sessionId } });
  if (existing?.status === NoteStatus.FINALIZED) {
    throw new AppError('This SOAP note has been finalized and cannot be regenerated', 400);
  }

  // Fetch last 2 finalized notes for this patient (for clinical continuity)
  const previousNotes = await prisma.sOAPNote.findMany({
    where: {
      patientId: session.patientId,
      hospitalId,
      status: NoteStatus.FINALIZED,
      sessionId: { not: sessionId },
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
    include: { session: { select: { scheduledAt: true } } },
  });

  const transcriptText = session.transcriptions.length > 0
    ? buildTranscriptText(session.transcriptions)
    : '';

  // Reject truly empty sessions before calling Claude — a SOAP note from nothing
  // is meaningless and leads to "Not documented" placeholders in every section.
  const meaningfulText = transcriptText.replace(/\s+/g, ' ').trim();
  if (meaningfulText.length < 20) {
    throw new AppError(
      'This session has no recorded transcript to generate a note from. Record a consultation or add notes manually first.',
      400
    );
  }

  const historySection = previousNotes.length > 0
    ? `\nPrevious Visit History (last ${previousNotes.length} finalized visits):\n${previousNotes.map((n, i) => {
        const visitDate = n.session.scheduledAt.toISOString().slice(0, 10);
        return `Visit ${i + 1} (${visitDate}):\nAssessment: ${n.assessment}\nPlan: ${n.plan}`;
      }).join('\n\n')}\n`
    : '';

  const patientContext = `Patient: ${session.patient.firstName} ${session.patient.lastName}
Known allergies: ${session.patient.allergies.join(', ') || 'None documented'}
Chronic conditions: ${session.patient.chronicConditions.join(', ') || 'None documented'}${historySection}`;

  // Pick the template prompt for this session (default = general practice).
  const template = getTemplate(session.templateId);

  let parsed: z.infer<typeof SOAPResponseSchema>;
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 2048,
      system: template.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${patientContext}\n\nConsultation Transcript:\n${transcriptText}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

    const rawJson = content.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = SOAPResponseSchema.parse(JSON.parse(rawJson));
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string; status?: number; error?: unknown; stack?: string };
    logger.error('SOAP generation failed', {
      sessionId,
      errorName: e?.name ?? 'Unknown',
      errorMessage: e?.message ?? String(err),
      errorStatus: e?.status,
      errorBody: e?.error ? JSON.stringify(e.error) : undefined,
      stack: e?.stack?.split('\n').slice(0, 5).join(' | '),
    });
    throw new AppError(
      `Failed to generate SOAP note: ${e?.message || 'unknown error'}`,
      503
    );
  }

  // Non-blocking drug interaction check
  const drugWarnings = await checkDrugInteractions(parsed.plan).catch(() => [] as string[]);

  const note = await prisma.sOAPNote.upsert({
    where: { sessionId },
    create: {
      sessionId,
      hospitalId,
      patientId: session.patientId,
      ...parsed,
      status: NoteStatus.AI_GENERATED,
      aiModel: config.CLAUDE_MODEL,
      promptVersion: config.SOAP_PROMPT_VERSION,
      drugWarnings: drugWarnings.length > 0 ? JSON.stringify(drugWarnings) : null,
    },
    update: {
      ...parsed,
      status: NoteStatus.AI_GENERATED,
      aiModel: config.CLAUDE_MODEL,
      promptVersion: config.SOAP_PROMPT_VERSION,
      ttsAudioUrl: null,
      ttsGeneratedAt: null,
      drugWarnings: drugWarnings.length > 0 ? JSON.stringify(drugWarnings) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: 'system',
      hospitalId,
      action: 'GENERATE_SOAP',
      resource: 'SOAPNote',
      resourceId: note.id,
      metadata: { sessionId, promptVersion: config.SOAP_PROMPT_VERSION },
    },
  });

  // Awaited so extractions are persisted before the client fetches the session
  await extractFromSOAPNote(note.id).catch((err) =>
    logger.error('EHR extraction failed (non-fatal)', { error: err, soapNoteId: note.id })
  );

  return note;
};

export const getSOAPNote = async (id: string, hospitalId: string) => {
  const note = await prisma.sOAPNote.findFirst({
    where: { id, hospitalId },
    include: {
      session: {
        include: {
          doctor: { select: { firstName: true, lastName: true, specialization: true } },
        },
      },
      patient: { select: { firstName: true, lastName: true, medicalRecordNo: true } },
    },
  });
  if (!note) throw new AppError('SOAP note not found', 404);
  return note;
};

export const listPatientNotes = async (patientUserId: string, hospitalId: string) => {
  const patient = await prisma.patient.findFirst({ where: { userId: patientUserId, hospitalId } });
  if (!patient) throw new AppError('Patient profile not found', 404);

  return prisma.sOAPNote.findMany({
    where: { patientId: patient.id, hospitalId, status: NoteStatus.FINALIZED },
    orderBy: { createdAt: 'desc' },
    include: {
      session: {
        include: { doctor: { select: { firstName: true, lastName: true, specialization: true } } },
      },
    },
  });
};

export const updateSOAPNote = async (
  id: string,
  hospitalId: string,
  doctorUserId: string,
  data: { subjective?: string; objective?: string; assessment?: string; plan?: string }
) => {
  const note = await prisma.sOAPNote.findFirst({ where: { id, hospitalId } });
  if (!note) throw new AppError('SOAP note not found', 404);
  if (note.status === NoteStatus.FINALIZED) {
    throw new AppError('Finalized notes cannot be edited', 400);
  }

  const session = await prisma.consultationSession.findFirst({
    where: { id: note.sessionId },
    include: { doctor: { select: { userId: true } } },
  });
  if (session?.doctor.userId !== doctorUserId) {
    throw new AppError('Only the session doctor can edit this note', 403);
  }

  // Capture per-section diffs as correction signal before writing.
  const sections: Array<keyof typeof data> = ['subjective', 'objective', 'assessment', 'plan'];
  for (const field of sections) {
    const next = data[field];
    if (next == null) continue;
    const prev = note[field as 'subjective' | 'objective' | 'assessment' | 'plan'];
    if (isMeaningfulChange(prev, next)) {
      logCorrection({
        hospitalId,
        doctorUserId,
        artifactType: 'SOAP_SECTION',
        artifactId: note.id,
        correctionKind: 'EDIT',
        field,
        aiValue: prev,
        doctorValue: next,
        soapNoteId: note.id,
        metadata: {
          aiModel: note.aiModel,
          promptVersion: note.promptVersion,
          previousStatus: note.status,
        },
      });
    }
  }

  return prisma.sOAPNote.update({
    where: { id },
    data: { ...data, status: NoteStatus.DOCTOR_REVIEWED },
  });
};

export const finalizeSOAPNote = async (id: string, hospitalId: string, doctorUserId: string) => {
  const note = await prisma.sOAPNote.findFirst({ where: { id, hospitalId } });
  if (!note) throw new AppError('SOAP note not found', 404);
  if (note.status === NoteStatus.FINALIZED) {
    throw new AppError('Note is already finalized', 400);
  }

  const session = await prisma.consultationSession.findFirst({
    where: { id: note.sessionId },
    include: { doctor: { select: { userId: true } } },
  });
  if (session?.doctor.userId !== doctorUserId) {
    throw new AppError('Only the session doctor can finalize this note', 403);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.sOAPNote.update({
      where: { id },
      data: { status: NoteStatus.FINALIZED, doctorSignedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        userId: doctorUserId,
        hospitalId,
        action: 'FINALIZE_NOTE',
        resource: 'SOAPNote',
        resourceId: id,
      },
    });
    return updated;
  });
};

// Transfer the finalized SOAP note + EHR extractions + NHIA claim to the
// hospital's records inbox. Hospital must have recordsEmail configured.
export const transferSoapNoteToRecords = async (
  id: string,
  hospitalId: string,
  doctorUserId: string
) => {
  const note = await prisma.sOAPNote.findFirst({
    where: { id, hospitalId },
    include: {
      hospital: true,
      patient: true,
      session: { include: { doctor: true } },
      problems: { include: { billingCodes: { orderBy: { createdAt: 'asc' } } } },
      orders: { include: { billingCodes: { orderBy: { createdAt: 'asc' } } } },
      billingCodes: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!note) throw new AppError('SOAP note not found', 404);
  if (note.status !== NoteStatus.FINALIZED) {
    throw new AppError('Only finalized notes can be transferred', 400);
  }
  if (!note.hospital.recordsEmail) {
    throw new AppError(
      'No records inbox configured for this hospital. Set Hospital.recordsEmail first.',
      400
    );
  }

  const visitNhia = note.billingCodes.find(
    (c) => c.codeType === 'NHIA' && c.problemId === null && c.orderId === null && c.isSelected
  );

  const claimTotal = [
    visitNhia?.tariffNgn ?? 0,
    ...note.orders.flatMap((o) =>
      o.billingCodes
        .filter((c) => c.codeType === 'NHIA' && c.isSelected)
        .map((c) => c.tariffNgn ?? 0)
    ),
  ].reduce((a, b) => a + b, 0);

  const problemsForEmail = note.problems.map((p) => ({
    name: p.name,
    status: p.status,
    icd10Code:
      p.billingCodes.find((c) => c.codeType === 'ICD10' && c.isSelected)?.code ??
      p.icd10Code ??
      null,
    snomedCode:
      p.billingCodes.find((c) => c.codeType === 'SNOMED' && c.isSelected)?.code ?? null,
  }));

  const ordersForEmail = note.orders.map((o) => {
    const nhia = o.billingCodes.find((c) => c.codeType === 'NHIA' && c.isSelected);
    return {
      type: o.type,
      name: o.name,
      dosage: o.dosage,
      frequency: o.frequency,
      duration: o.duration,
      instructions: o.instructions,
      nhiaCode: nhia?.code ?? null,
      nhiaDescription: nhia?.description ?? null,
      nhiaTariffNgn: nhia?.tariffNgn ?? null,
    };
  });

  const visitDate = note.session?.startedAt
    ? new Date(note.session.startedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })
    : new Date(note.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' });
  const patientName = `${note.patient.firstName} ${note.patient.lastName}`;
  const doctorName = note.session?.doctor
    ? `Dr. ${note.session.doctor.firstName} ${note.session.doctor.lastName}`
    : 'Treating clinician';

  await sendSoapNoteToRecords({
    recordsEmail: note.hospital.recordsEmail,
    hospitalName: note.hospital.name,
    patientName,
    patientMrn: note.patient.medicalRecordNo,
    patientDob: note.patient.dateOfBirth
      ? new Date(note.patient.dateOfBirth).toLocaleDateString('en-NG', { dateStyle: 'medium' })
      : null,
    doctorName,
    visitDate,
    subjective: note.subjective,
    objective: note.objective,
    assessment: note.assessment,
    plan: note.plan,
    problems: problemsForEmail,
    orders: ordersForEmail,
    visitNhiaCode: visitNhia?.code ?? null,
    visitNhiaDescription: visitNhia?.description ?? null,
    visitNhiaTariffNgn: visitNhia?.tariffNgn ?? null,
    claimTotalNgn: claimTotal > 0 ? claimTotal : null,
  });

  await prisma.auditLog.create({
    data: {
      userId: doctorUserId,
      hospitalId,
      action: 'TRANSFER_NOTE_TO_RECORDS',
      resource: 'SOAPNote',
      resourceId: id,
      metadata: { recordsEmail: note.hospital.recordsEmail },
    },
  });

  return { transferredTo: note.hospital.recordsEmail, transferredAt: new Date().toISOString() };
};
