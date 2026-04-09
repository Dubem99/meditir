import { Request, Response } from 'express';
import * as service from './sessions.service';
import { param, hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import * as soapService from '../soap-notes/soap-notes.service';

export const create = async (req: Request, res: Response): Promise<void> => {
  const session = await service.createSession(hospitalId(req), req.body);
  res.status(201).json({ status: 'success', data: session });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const result = await service.listSessions(
    hospitalId(req),
    req.user.id,
    req.user.role,
    req.query as { page?: number; limit?: number }
  );
  res.json({ status: 'success', ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const session = await service.getSession(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: session });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const session = await service.updateSession(param(req, 'id'), hospitalId(req), req.body);
  res.json({ status: 'success', data: session });
};

export const start = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const session = await service.startSession(param(req, 'id'), hospitalId(req), req.user.id);
  res.json({ status: 'success', data: session });
};

export const end = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const hid = hospitalId(req);
  const sid = param(req, 'id');
  const session = await service.endSession(sid, hid, req.user.id);

  soapService.generateSOAPNote(sid, hid).catch(() => {
    // Non-blocking: SOAP can be regenerated manually
  });

  res.json({ status: 'success', data: session, message: 'SOAP note generation started' });
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  await service.cancelSession(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', message: 'Session cancelled' });
};
