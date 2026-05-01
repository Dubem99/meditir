import { Request, Response } from 'express';
import * as service from './audit.service';

const clamp = (raw: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
};

export const getNhiaAudit = async (req: Request, res: Response): Promise<void> => {
  const days = clamp(req.query.days, 7, 1, 30);
  const limit = clamp(req.query.limit, 20, 1, 100);
  const data = await service.sampleNhiaCodesForAudit(days, limit);
  res.json({ status: 'success', data });
};
