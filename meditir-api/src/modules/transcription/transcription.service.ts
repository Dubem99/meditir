import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { Dialect, SyncStatus } from '../../types/enums';
import { logger } from '../../utils/logger';

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
