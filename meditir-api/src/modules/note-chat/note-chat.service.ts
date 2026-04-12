import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { NoteStatus } from '../../types/enums';
import { buildTranscriptText } from '../transcription/transcription.service';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a clinical reasoning assistant helping a doctor review a consultation note for a patient in a Nigerian hospital.

You have access to:
- The current SOAP note (subjective, objective, assessment, plan)
- The raw consultation transcript
- The patient's last few finalized notes for historical context
- Patient demographics, allergies, and chronic conditions

When the doctor asks you a question:
1. Answer concisely and accurately using ONLY the context provided. If the answer is not in the context, say so plainly.
2. Use proper medical terminology.
3. Reference specific notes or visits when relevant ("In the 2025-11-03 visit, you noted…").
4. If asked for clinical reasoning (differentials, red flags, next steps), provide them but mark them clearly as suggestions — the doctor is the decision-maker.
5. If asked to compare visits or find trends, walk through the relevant data points chronologically.
6. Never fabricate lab values, vitals, medications, or findings. If something isn't documented, say "not documented in this session".
7. Keep responses under 200 words unless the doctor asks for more detail.
8. Use markdown for structure (bullets, bold) where it improves readability.`;

interface SendMessageArgs {
  sessionId: string;
  hospitalId: string;
  userMessage: string;
}

const buildContextBlock = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    include: {
      transcriptions: { orderBy: { startMs: 'asc' } },
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
          genotype: true,
          allergies: true,
          chronicConditions: true,
        },
      },
      soapNote: true,
      doctor: { select: { firstName: true, lastName: true, specialization: true } },
    },
  });

  if (!session) throw new AppError('Session not found', 404);
  if (!session.soapNote) {
    throw new AppError(
      'This session has no clinical note yet. Generate the SOAP note first before chatting about it.',
      400
    );
  }

  const previousNotes = await prisma.sOAPNote.findMany({
    where: {
      patientId: session.patientId,
      hospitalId,
      status: NoteStatus.FINALIZED,
      sessionId: { not: sessionId },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { session: { select: { scheduledAt: true } } },
  });

  const age = session.patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(session.patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const demographics = [
    `Patient: ${session.patient.firstName} ${session.patient.lastName}`,
    age !== null ? `Age: ${age}` : null,
    session.patient.gender ? `Gender: ${session.patient.gender}` : null,
    session.patient.bloodGroup ? `Blood group: ${session.patient.bloodGroup}` : null,
    session.patient.genotype ? `Genotype: ${session.patient.genotype}` : null,
    `Allergies: ${session.patient.allergies.join(', ') || 'None documented'}`,
    `Chronic conditions: ${session.patient.chronicConditions.join(', ') || 'None documented'}`,
    `Treating doctor: Dr. ${session.doctor.firstName} ${session.doctor.lastName} (${session.doctor.specialization})`,
  ]
    .filter(Boolean)
    .join('\n');

  const currentNote = `# Current SOAP Note (this visit)
**Subjective:** ${session.soapNote.subjective}
**Objective:** ${session.soapNote.objective}
**Assessment:** ${session.soapNote.assessment}
**Plan:** ${session.soapNote.plan}`;

  const transcriptBlock = session.transcriptions.length > 0
    ? `# Raw Transcript of this visit\n${buildTranscriptText(session.transcriptions)}`
    : '# Raw Transcript of this visit\n(No transcript recorded for this session.)';

  const historyBlock = previousNotes.length > 0
    ? `# Previous Visits (most recent first)\n${previousNotes
        .map((n, i) => {
          const date = n.session.scheduledAt.toISOString().slice(0, 10);
          return `## Visit ${i + 1} — ${date}\n**Assessment:** ${n.assessment}\n**Plan:** ${n.plan}`;
        })
        .join('\n\n')}`
    : '# Previous Visits\n(This is the first documented visit for this patient.)';

  return `# Patient Context\n${demographics}\n\n${currentNote}\n\n${transcriptBlock}\n\n${historyBlock}`;
};

export const sendMessage = async ({ sessionId, hospitalId, userMessage }: SendMessageArgs) => {
  const trimmed = userMessage.trim();
  if (!trimmed) throw new AppError('Message cannot be empty', 400);
  if (trimmed.length > 2000) throw new AppError('Message too long (max 2000 characters)', 400);

  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    select: { id: true, soapNote: { select: { id: true } } },
  });
  if (!session) throw new AppError('Session not found', 404);

  const context = await buildContextBlock(sessionId, hospitalId);

  // Load recent chat history for this session to maintain conversation flow
  const history = await prisma.noteChatMessage.findMany({
    where: { sessionId, hospitalId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = history.map((m) => ({
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
  }));
  claudeMessages.push({ role: 'user', content: trimmed });

  let assistantText: string;
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\n---\n\n${context}`,
      messages: claudeMessages,
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected response type from Claude');
    assistantText = block.text.trim();
  } catch (err) {
    logger.error('Note chat failed', { error: err, sessionId });
    throw new AppError('Failed to get a response. Please try again.', 503);
  }

  // Persist both sides
  const [userMsg, assistantMsg] = await prisma.$transaction([
    prisma.noteChatMessage.create({
      data: {
        sessionId,
        hospitalId,
        soapNoteId: session.soapNote?.id ?? null,
        role: 'USER',
        content: trimmed,
      },
    }),
    prisma.noteChatMessage.create({
      data: {
        sessionId,
        hospitalId,
        soapNoteId: session.soapNote?.id ?? null,
        role: 'ASSISTANT',
        content: assistantText,
      },
    }),
  ]);

  return { userMessage: userMsg, assistantMessage: assistantMsg };
};

export const listMessages = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    select: { id: true },
  });
  if (!session) throw new AppError('Session not found', 404);

  return prisma.noteChatMessage.findMany({
    where: { sessionId, hospitalId },
    orderBy: { createdAt: 'asc' },
  });
};

export const clearMessages = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    select: { id: true },
  });
  if (!session) throw new AppError('Session not found', 404);

  await prisma.noteChatMessage.deleteMany({ where: { sessionId, hospitalId } });
};

// ─────────────────────────────────────────────────────────────
// PATIENT-LEVEL CHAT
// Chat that spans every visit this patient has ever had
// ─────────────────────────────────────────────────────────────

const PATIENT_SYSTEM_PROMPT = `You are a clinical reasoning assistant helping a doctor review a patient's full longitudinal history at a Nigerian hospital.

You have access to:
- Patient demographics, allergies, and chronic conditions
- Every finalized SOAP note from every visit this patient has ever had, in reverse chronological order
- Currently active problems and medications aggregated across visits

When the doctor asks you a question:
1. Answer concisely using ONLY the context provided. If something isn't in the history, say so plainly.
2. When comparing visits or trends, walk through specific dates and what changed.
3. Use proper medical terminology but stay faithful to what was actually documented.
4. For clinical reasoning (differentials, red flags, next steps), provide them as suggestions — the doctor decides.
5. Never fabricate vitals, labs, meds, or findings.
6. Keep responses under 250 words unless the doctor asks for more detail.
7. Use markdown (bullets, bold) for structure where it helps.`;

const buildPatientContextBlock = async (patientId: string, hospitalId: string) => {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, hospitalId },
    select: {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      bloodGroup: true,
      genotype: true,
      allergies: true,
      chronicConditions: true,
    },
  });
  if (!patient) throw new AppError('Patient not found', 404);

  // Last 10 finalized notes for this patient across all sessions
  const notes = await prisma.sOAPNote.findMany({
    where: { patientId, hospitalId, status: NoteStatus.FINALIZED },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      session: {
        select: {
          scheduledAt: true,
          doctor: { select: { firstName: true, lastName: true, specialization: true } },
        },
      },
    },
  });

  // Aggregated problems and current meds
  const [problems, meds] = await Promise.all([
    prisma.problem.findMany({
      where: { patientId, hospitalId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { patientId, hospitalId, type: 'MEDICATION' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const age = patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const demographics = [
    `Patient: ${patient.firstName} ${patient.lastName}`,
    age !== null ? `Age: ${age}` : null,
    patient.gender ? `Gender: ${patient.gender}` : null,
    patient.bloodGroup ? `Blood group: ${patient.bloodGroup}` : null,
    patient.genotype ? `Genotype: ${patient.genotype}` : null,
    `Allergies: ${patient.allergies.join(', ') || 'None documented'}`,
    `Chronic conditions: ${patient.chronicConditions.join(', ') || 'None documented'}`,
  ]
    .filter(Boolean)
    .join('\n');

  const notesBlock = notes.length > 0
    ? `# Visit History (last ${notes.length} finalized visits, most recent first)\n${notes
        .map((n, i) => {
          const date = n.session.scheduledAt.toISOString().slice(0, 10);
          const doc = n.session.doctor;
          return `## Visit ${i + 1} — ${date} (Dr. ${doc.firstName} ${doc.lastName}, ${doc.specialization})
**Subjective:** ${n.subjective}
**Assessment:** ${n.assessment}
**Plan:** ${n.plan}`;
        })
        .join('\n\n')}`
    : '# Visit History\n(No finalized visits yet for this patient.)';

  const problemsBlock = problems.length > 0
    ? `# Tracked Problems\n${problems
        .map((p) => `- ${p.name} (${p.status}${p.icd10Code ? ', ' + p.icd10Code : ''})`)
        .join('\n')}`
    : '# Tracked Problems\n(None recorded.)';

  const medsBlock = meds.length > 0
    ? `# All Medication History\n${meds
        .map(
          (m) =>
            `- ${m.name}${m.dosage ? ' ' + m.dosage : ''}${m.frequency ? ' ' + m.frequency : ''} (${m.status})`
        )
        .join('\n')}`
    : '# All Medication History\n(None recorded.)';

  return `# Patient Context\n${demographics}\n\n${notesBlock}\n\n${problemsBlock}\n\n${medsBlock}`;
};

export const sendPatientMessage = async ({
  patientId,
  hospitalId,
  userMessage,
}: {
  patientId: string;
  hospitalId: string;
  userMessage: string;
}) => {
  const trimmed = userMessage.trim();
  if (!trimmed) throw new AppError('Message cannot be empty', 400);
  if (trimmed.length > 2000) throw new AppError('Message too long (max 2000 characters)', 400);

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, hospitalId },
    select: { id: true },
  });
  if (!patient) throw new AppError('Patient not found', 404);

  const context = await buildPatientContextBlock(patientId, hospitalId);

  const history = await prisma.noteChatMessage.findMany({
    where: { patientId, sessionId: null, hospitalId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = history.map((m) => ({
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
  }));
  claudeMessages.push({ role: 'user', content: trimmed });

  let assistantText: string;
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 1536,
      system: `${PATIENT_SYSTEM_PROMPT}\n\n---\n\n${context}`,
      messages: claudeMessages,
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected response type from Claude');
    assistantText = block.text.trim();
  } catch (err) {
    logger.error('Patient chat failed', { error: err, patientId });
    throw new AppError('Failed to get a response. Please try again.', 503);
  }

  const [userMsg, assistantMsg] = await prisma.$transaction([
    prisma.noteChatMessage.create({
      data: { patientId, hospitalId, role: 'USER', content: trimmed },
    }),
    prisma.noteChatMessage.create({
      data: { patientId, hospitalId, role: 'ASSISTANT', content: assistantText },
    }),
  ]);

  return { userMessage: userMsg, assistantMessage: assistantMsg };
};

export const listPatientMessages = async (patientId: string, hospitalId: string) => {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, hospitalId },
    select: { id: true },
  });
  if (!patient) throw new AppError('Patient not found', 404);

  return prisma.noteChatMessage.findMany({
    where: { patientId, sessionId: null, hospitalId },
    orderBy: { createdAt: 'asc' },
  });
};

export const clearPatientMessages = async (patientId: string, hospitalId: string) => {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, hospitalId },
    select: { id: true },
  });
  if (!patient) throw new AppError('Patient not found', 404);

  await prisma.noteChatMessage.deleteMany({
    where: { patientId, sessionId: null, hospitalId },
  });
};
