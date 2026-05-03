import { Request, Response } from 'express';
import * as service from './transcription.service';
import { transcribeAudioChunk } from './transcription.stt.service';
import { hospitalId, param } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { Dialect } from '../../types/enums';

export const saveSegment = async (req: Request, res: Response): Promise<void> => {
  const transcription = await service.saveSegment(hospitalId(req), req.body);
  res.status(201).json({ status: 'success', data: transcription });
};

// Streaming transcription endpoint.
//
// Browser captures 5-10s audio chunks via MediaRecorder, posts each one here
// as multipart/form-data. We forward the audio to OpenAI gpt-4o-transcribe
// with the dialect-derived language hint, then save the resulting transcript
// as a Transcription row using the existing service.
//
// Audio is held in memory only — never persisted on Meditir's side. OpenAI's
// API terms commit to no training/no retention beyond processing.
export const streamTranscribe = async (req: Request, res: Response): Promise<void> => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) throw new AppError('Missing audio chunk (form field "audio")', 400);

  const sessionId = (req.body.sessionId ?? '').toString().trim();
  if (!sessionId) throw new AppError('sessionId is required', 400);

  const rawDialect = (req.body.dialect ?? '').toString().trim() as Dialect;
  const validDialects: Dialect[] = [
    Dialect.NIGERIAN_ENGLISH,
    Dialect.YORUBA_ACCENTED,
    Dialect.HAUSA_ACCENTED,
    Dialect.IGBO_ACCENTED,
  ];
  const dialect: Dialect = validDialects.includes(rawDialect)
    ? rawDialect
    : Dialect.NIGERIAN_ENGLISH;

  const startMs = req.body.startMs ? Number(req.body.startMs) : undefined;
  const speakerTag = (req.body.speakerTag ?? 'DOCTOR').toString();

  const transcribed = await transcribeAudioChunk(file.buffer, dialect, file.originalname);

  // Skip empty results — common when a chunk captures only silence.
  if (!transcribed.text) {
    res.json({ status: 'success', data: null, meta: { skipped: 'empty', durationMs: transcribed.durationMs } });
    return;
  }

  const transcription = await service.saveSegment(hospitalId(req), {
    sessionId,
    text: transcribed.text,
    dialect,
    speakerTag,
    startMs,
  });

  res.status(201).json({
    status: 'success',
    data: transcription,
    meta: {
      sttDurationMs: transcribed.durationMs,
      language: transcribed.language,
    },
  });
};

export const getTranscript = async (req: Request, res: Response): Promise<void> => {
  const sessionId = Array.isArray(req.params.sessionId)
    ? req.params.sessionId[0]
    : req.params.sessionId;
  const transcriptions = await service.getSessionTranscript(sessionId, hospitalId(req));
  res.json({ status: 'success', data: transcriptions });
};

export const editSegment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const text = (req.body?.text ?? '').toString();
  if (!text.trim()) throw new AppError('text is required', 400);
  const updated = await service.editTranscription(
    param(req, 'id'),
    hospitalId(req),
    text,
    req.user.id
  );
  res.json({ status: 'success', data: updated });
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
