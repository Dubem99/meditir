import { Request, Response } from 'express';
import * as service from './transcription.service';
import { hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { Dialect } from '../../types/enums';

export const uploadAndTranscribe = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('Audio file is required', 400);

  const { sessionId, dialect, speakerTag, startMs } = req.body;
  if (!sessionId) throw new AppError('sessionId is required', 400);

  const result = await service.transcribeAudioBuffer(
    sessionId as string,
    req.file.buffer,
    req.file.mimetype,
    (dialect as Dialect) || Dialect.NIGERIAN_ENGLISH,
    speakerTag as string | undefined,
    startMs ? parseInt(startMs as string, 10) : undefined
  );

  res.json({ status: 'success', data: result });
};

export const getTranscript = async (req: Request, res: Response): Promise<void> => {
  const sessionId = Array.isArray(req.params.sessionId)
    ? req.params.sessionId[0]
    : req.params.sessionId;
  const transcriptions = await service.getSessionTranscript(sessionId, hospitalId(req));
  res.json({ status: 'success', data: transcriptions });
};

export const offlineSync = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const results = await service.syncOfflineTranscriptions(
    req.user.id,
    hospitalId(req),
    req.body.chunks
  );
  res.json({ status: 'success', data: { synced: results.length } });
};
