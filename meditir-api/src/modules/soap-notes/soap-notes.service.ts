import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { NoteStatus } from '../../types/enums';
import { buildTranscriptText } from '../transcription/transcription.service';
import { logger } from '../../utils/logger';

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
- Subjective: Patient's reported complaints, symptoms, history (in the patient's own words, paraphrased clinically)
- Objective: Observable findings — vitals mentioned, physical exam results, test results referenced
- Assessment: Clinical interpretation — working diagnosis or differential diagnoses
- Plan: Treatment plan — medications, referrals, follow-up, lifestyle advice

Rules:
1. Only include information explicitly stated in the transcript.
2. Use proper medical terminology.
3. If a section has no data from the transcript, write "Not documented in session."
4. Respond ONLY with a valid JSON object — no markdown, no explanation.

JSON format:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "..."
}`;

export const generateSOAPNote = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    include: {
      transcriptions: { orderBy: { startMs: 'asc' } },
      patient: { select: { id: true, firstName: true, lastName: true, allergies: true, chronicConditions: true } },
    },
  });

  if (!session) throw new AppError('Session not found', 404);

  // Check if SOAP already exists
  const existing = await prisma.sOAPNote.findUnique({ where: { sessionId } });
  if (existing?.status === NoteStatus.FINALIZED) {
    throw new AppError('This SOAP note has been finalized and cannot be regenerated', 400);
  }

  if (session.transcriptions.length === 0) {
    throw new AppError('No transcriptions found for this session', 400);
  }

  const transcriptText = buildTranscriptText(session.transcriptions);
  const patientContext = `
Patient: ${session.patient.firstName} ${session.patient.lastName}
Known allergies: ${session.patient.allergies.join(', ') || 'None documented'}
Chronic conditions: ${session.patient.chronicConditions.join(', ') || 'None documented'}
`;

  let parsed: z.infer<typeof SOAPResponseSchema>;
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${patientContext}\n\nConsultation Transcript:\n${transcriptText}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

    const rawJson = content.text.trim();
    parsed = SOAPResponseSchema.parse(JSON.parse(rawJson));
  } catch (err) {
    logger.error('SOAP generation failed', { error: err, sessionId });
    throw new AppError('Failed to generate SOAP note. Please try again.', 503);
  }

  // Upsert the SOAP note
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
    },
    update: {
      ...parsed,
      status: NoteStatus.AI_GENERATED,
      aiModel: config.CLAUDE_MODEL,
      promptVersion: config.SOAP_PROMPT_VERSION,
      ttsAudioUrl: null,
      ttsGeneratedAt: null,
    },
  });

  // Audit log
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

  // Verify the doctor owns this session
  const session = await prisma.consultationSession.findFirst({
    where: { id: note.sessionId },
    include: { doctor: { select: { userId: true } } },
  });
  if (session?.doctor.userId !== doctorUserId) {
    throw new AppError('Only the session doctor can edit this note', 403);
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
