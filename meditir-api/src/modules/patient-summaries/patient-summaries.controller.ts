import { Request, Response } from 'express';
import * as service from './patient-summaries.service';
import { param, hospitalId } from '../../utils/params';

export const generate = async (req: Request, res: Response): Promise<void> => {
  const { soapNoteId, language } = req.body;
  const summary = await service.generatePatientSummary(soapNoteId, hospitalId(req), language);
  res.status(201).json({ status: 'success', data: summary });
};

export const listBySession = async (req: Request, res: Response): Promise<void> => {
  const summaries = await service.listForSession(param(req, 'sessionId'), hospitalId(req));
  res.json({ status: 'success', data: summaries });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const s = await service.updateSummary(param(req, 'id'), hospitalId(req), req.body);
  res.json({ status: 'success', data: s });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  await service.deleteSummary(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success' });
};

export const send = async (req: Request, res: Response): Promise<void> => {
  const { channels } = req.body;
  const result = await service.sendSummary(param(req, 'id'), hospitalId(req), channels);
  res.json({ status: 'success', data: result });
};
