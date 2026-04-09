import { Request, Response } from 'express';
import * as service from './soap-notes.service';
import * as ttsService from '../tts/tts.service';
import { param, hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { prisma } from '../../config/database';

export const generate = async (req: Request, res: Response): Promise<void> => {
  const note = await service.generateSOAPNote(req.body.sessionId, hospitalId(req));
  res.status(201).json({ status: 'success', data: note });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const note = await service.getSOAPNote(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: note });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const note = await service.updateSOAPNote(param(req, 'id'), hospitalId(req), req.user.id, req.body);
  res.json({ status: 'success', data: note });
};

export const finalize = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const note = await service.finalizeSOAPNote(param(req, 'id'), hospitalId(req), req.user.id);
  res.json({ status: 'success', data: note });
};

export const getTTS = async (req: Request, res: Response): Promise<void> => {
  const noteId = param(req, 'id');
  const note = await service.getSOAPNote(noteId, hospitalId(req));

  if (note.ttsAudioUrl) {
    res.json({ status: 'success', data: { audioUrl: note.ttsAudioUrl, cached: true } });
    return;
  }

  const summary = `Patient Summary:\n${note.subjective}\n\nAssessment: ${note.assessment}\n\nPlan: ${note.plan}`;
  const audioUrl = await ttsService.generateTTSAudio(summary, req.user?.id || 'system');

  await prisma.sOAPNote.update({
    where: { id: note.id },
    data: { ttsAudioUrl: audioUrl, ttsGeneratedAt: new Date() },
  });

  res.json({ status: 'success', data: { audioUrl, cached: false } });
};
