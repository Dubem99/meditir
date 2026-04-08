import OpenAI from 'openai';
import { Readable } from 'stream';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { Dialect, SyncStatus } from '../../types/enums';
import { logger } from '../../utils/logger';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

/**
 * Maps dialect enum to Whisper API parameters for accent-aware transcription.
 */
const dialectToWhisperParams = (
  dialect: Dialect
): { language: string; prompt: string } => {
  switch (dialect) {
    case Dialect.YORUBA_ACCENTED:
      return {
        language: 'en',
        prompt:
          'Nigerian medical consultation with Yoruba-accented English. Medical terminology, symptoms, diagnoses.',
      };
    case Dialect.HAUSA_ACCENTED:
      return {
        language: 'en',
        prompt:
          'Nigerian medical consultation with Hausa-accented English. Medical terminology, symptoms, diagnoses.',
      };
    case Dialect.IGBO_ACCENTED:
      return {
        language: 'en',
        prompt:
          'Nigerian medical consultation with Igbo-accented English. Medical terminology, symptoms, diagnoses.',
      };
    case Dialect.NIGERIAN_ENGLISH:
    default:
      return {
        language: 'en',
        prompt:
          'Nigerian English medical consultation. Doctor and patient discussing symptoms, medications, and treatment plans.',
      };
  }
};

/**
 * Transcribe an audio buffer (single file upload).
 */
export const transcribeAudioBuffer = async (
  sessionId: string,
  audioBuffer: Buffer,
  mimeType: string,
  dialect: Dialect,
  speakerTag?: string,
  startMs?: number
) => {
  const session = await prisma.consultationSession.findUnique({
    where: { id: sessionId },
    select: { id: true, hospitalId: true },
  });
  if (!session) throw new AppError('Session not found', 404);

  const whisperParams = dialectToWhisperParams(dialect);

  // Convert Buffer to File-like for OpenAI SDK
  const file = new File([audioBuffer], `audio.${mimeType.split('/')[1] || 'webm'}`, {
    type: mimeType,
  });

  let text: string;
  try {
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: whisperParams.language,
      prompt: whisperParams.prompt,
      response_format: 'verbose_json',
    });
    text = response.text.trim();
  } catch (err) {
    logger.error('Whisper transcription failed', { error: err, sessionId });
    throw new AppError('Transcription service unavailable', 503);
  }

  if (!text) return null;

  const transcription = await prisma.transcription.create({
    data: {
      sessionId,
      text,
      dialect,
      speakerTag: speakerTag || 'UNKNOWN',
      startMs,
      syncStatus: SyncStatus.SYNCED,
    },
  });

  return transcription;
};

/**
 * Get full transcript for a session.
 */
export const getSessionTranscript = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
  });
  if (!session) throw new AppError('Session not found', 404);

  return prisma.transcription.findMany({
    where: { sessionId },
    orderBy: { startMs: 'asc' },
  });
};

/**
 * Bulk-sync offline transcription chunks.
 */
export const syncOfflineTranscriptions = async (
  userId: string,
  hospitalId: string,
  chunks: Array<{
    sessionId: string;
    text: string;
    dialect: Dialect;
    speakerTag?: string;
    startMs?: number;
    endMs?: number;
    createdAt?: string;
  }>
) => {
  const results = [];
  for (const chunk of chunks) {
    const session = await prisma.consultationSession.findFirst({
      where: { id: chunk.sessionId, hospitalId },
    });
    if (!session) continue;

    const record = await prisma.transcription.create({
      data: {
        sessionId: chunk.sessionId,
        text: chunk.text,
        dialect: chunk.dialect,
        speakerTag: chunk.speakerTag || 'UNKNOWN',
        startMs: chunk.startMs,
        endMs: chunk.endMs,
        syncStatus: SyncStatus.SYNCED,
        createdAt: chunk.createdAt ? new Date(chunk.createdAt) : undefined,
      },
    });
    results.push(record);
  }

  // Record sync in audit queue
  await prisma.offlineSyncQueue.create({
    data: {
      userId,
      hospitalId,
      entityType: 'transcription',
      payload: { count: chunks.length },
      syncStatus: SyncStatus.SYNCED,
      syncedAt: new Date(),
    },
  });

  return results;
};

/**
 * Build a formatted transcript string for SOAP generation.
 */
export const buildTranscriptText = (
  transcriptions: Array<{ speakerTag: string | null; text: string }>
): string =>
  transcriptions
    .map((t) => `[${t.speakerTag || 'UNKNOWN'}]: ${t.text}`)
    .join('\n');
