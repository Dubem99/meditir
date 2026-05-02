import { Request, Response } from 'express';
import * as service from './ehr-extractions.service';
import { param, hospitalId } from '../../utils/params';

const userId = (req: Request): string | undefined => req.user?.id;

export const getBySession = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getExtractionsForSession(param(req, 'sessionId'), hospitalId(req));
  res.json({ status: 'success', data });
};

export const regenerate = async (req: Request, res: Response): Promise<void> => {
  const sessionId = param(req, 'sessionId');
  const existing = await service.getExtractionsForSession(sessionId, hospitalId(req));
  const result = await service.extractFromSOAPNote(existing.soapNoteId);
  res.json({ status: 'success', data: result });
};

export const patchProblem = async (req: Request, res: Response): Promise<void> => {
  const p = await service.updateProblem(param(req, 'id'), hospitalId(req), req.body, userId(req));
  res.json({ status: 'success', data: p });
};

export const patchOrder = async (req: Request, res: Response): Promise<void> => {
  const o = await service.updateOrder(param(req, 'id'), hospitalId(req), req.body, userId(req));
  res.json({ status: 'success', data: o });
};

export const removeProblem = async (req: Request, res: Response): Promise<void> => {
  await service.deleteProblem(param(req, 'id'), hospitalId(req), userId(req));
  res.json({ status: 'success' });
};

export const removeOrder = async (req: Request, res: Response): Promise<void> => {
  await service.deleteOrder(param(req, 'id'), hospitalId(req), userId(req));
  res.json({ status: 'success' });
};

export const removeBillingCode = async (req: Request, res: Response): Promise<void> => {
  await service.deleteBillingCode(param(req, 'id'), hospitalId(req), userId(req));
  res.json({ status: 'success' });
};

export const patchBillingCode = async (req: Request, res: Response): Promise<void> => {
  const c = await service.selectBillingCode(
    param(req, 'id'),
    hospitalId(req),
    Boolean(req.body?.isSelected),
    userId(req)
  );
  res.json({ status: 'success', data: c });
};

export const createBillingCode = async (req: Request, res: Response): Promise<void> => {
  const c = await service.addBillingCode(hospitalId(req), req.body, userId(req));
  res.status(201).json({ status: 'success', data: c });
};

export const getNhiaCatalog = async (_req: Request, res: Response): Promise<void> => {
  res.json({ status: 'success', data: service.getNhiaCatalog() });
};

export const createProblem = async (req: Request, res: Response): Promise<void> => {
  const { soapNoteId, ...data } = req.body;
  const p = await service.addProblem(soapNoteId, hospitalId(req), data);
  res.status(201).json({ status: 'success', data: p });
};
