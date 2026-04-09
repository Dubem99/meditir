import { Request, Response } from 'express';
import * as service from './hospitals.service';
import { param } from '../../utils/params';

export const create = async (req: Request, res: Response): Promise<void> => {
  const hospital = await service.createHospital(req.body);
  res.status(201).json({ status: 'success', data: hospital });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listHospitals(req.query as { page?: number; limit?: number; search?: string });
  res.json({ status: 'success', ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const hospital = await service.getHospital(param(req, 'id'));
  res.json({ status: 'success', data: hospital });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const hospital = await service.updateHospital(param(req, 'id'), req.body);
  res.json({ status: 'success', data: hospital });
};

export const deactivate = async (req: Request, res: Response): Promise<void> => {
  await service.deactivateHospital(param(req, 'id'));
  res.json({ status: 'success', message: 'Hospital deactivated' });
};

export const stats = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getHospitalStats(param(req, 'id'));
  res.json({ status: 'success', data });
};

export const myStats = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.hospitalId) {
    res.status(400).json({ status: 'error', message: 'No hospital associated with this account' });
    return;
  }
  const data = await service.getHospitalStats(req.user.hospitalId);
  res.json({ status: 'success', data });
};
