import { Request, Response } from 'express';
import * as service from './note-chat.service';
import { param, hospitalId } from '../../utils/params';

export const list = async (req: Request, res: Response): Promise<void> => {
  const messages = await service.listMessages(param(req, 'sessionId'), hospitalId(req));
  res.json({ status: 'success', data: messages });
};

export const send = async (req: Request, res: Response): Promise<void> => {
  const result = await service.sendMessage({
    sessionId: param(req, 'sessionId'),
    hospitalId: hospitalId(req),
    userMessage: req.body.message,
  });
  res.status(201).json({ status: 'success', data: result });
};

export const clear = async (req: Request, res: Response): Promise<void> => {
  await service.clearMessages(param(req, 'sessionId'), hospitalId(req));
  res.json({ status: 'success' });
};
