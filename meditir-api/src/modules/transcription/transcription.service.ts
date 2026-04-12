import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { Dialect, SyncStatus } from '../../types/enums';
import { logger } from '../../utils/logger';

/**
 * Save a single real-time transcription segment via REST (reliable fallback to Socket.io).
 */
export const saveSegment = async (
  hospitalId: string,
  data: { sessionId: string; text: string; dialect: Dialect; speakerTag?: string; startMs?: number }
) => {
  logger.info('[transcription] saveSegment called', {
    sessionId: data.sessionId,
    hospitalId,
    textLength: data.text?.length ?? 0,
  });

  const session = await prisma.consultationSession.findFirst({
    where: { id: data.sessionId, hospitalId },
    select: { id: true, status: true, roomToken: true, hospitalId: true },
  });

  if (!session) {
    // Debug: check if session exists at all (without hospital filter)
    const anySession = await prisma.consultationSession.findUnique({
      where: { id: data.sessionId },
      select: { id: true, hospitalId: true, status: true },
    });
    logger.error('[transcription] Session not found', {
      sessionId: data.sessionId,
      resolvedHospitalId: hospitalId,
      sessionExists: !!anySession,
      actualHospitalId: anySession?.hospitalId ?? null,
      mismatch: anySession ? anySession.hospitalId !== hospitalId : false,
    });
    throw new AppError('Session not found', 404);
  }
  if (session.status !== 'IN_PROGRESS') throw new AppError('Session is not in progress', 400);
  if (!data.text?.trim()) throw new AppError('Text is required', 400);

  return prisma.transcription.create({
    data: {
      sessionId: data.sessionId,
      text: data.text.trim(),
      dialect: data.dialect ?? Dialect.NIGERIAN_ENGLISH,
      speakerTag: data.speakerTag ?? 'DOCTOR',
      startMs: data.startMs ?? null,
      syncStatus: SyncStatus.SYNCED,
    },
  });
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
 * Bulk-sync offline transcription chunks (text-only, from browser IndexedDB).
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
        speakerTag: chunk.speakerTag ?? 'DOCTOR',
        startMs: chunk.startMs,
        endMs: chunk.endMs,
        syncStatus: SyncStatus.SYNCED,
        createdAt: chunk.createdAt ? new Date(chunk.createdAt) : undefined,
      },
    });
    results.push(record);
  }

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
    .map((t) => `[${t.speakerTag ?? 'UNKNOWN'}]: ${t.text}`)
    .join('\n');
