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
