import { Request, Response } from 'express';
import * as service from './additional-notes.service';
import { param, hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';

export const list = async (req: Request, res: Response): Promise<void> => {
  const notes = await service.listNotes(param(req, 'sessionId'), hospitalId(req));
  res.json({ status: 'success', data: notes });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const text = (req.body?.text ?? '').toString();
  const note = await service.addNote(
    param(req, 'sessionId'),
    hospitalId(req),
    req.user.id,
    text
  );
  res.status(201).json({ status: 'success', data: note });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  await service.deleteNote(param(req, 'noteId'), hospitalId(req), req.user.id);
  res.json({ status: 'success' });
};
