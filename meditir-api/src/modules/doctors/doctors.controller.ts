import { Request, Response } from 'express';
import * as service from './doctors.service';
import { param, hospitalId } from '../../utils/params';

export const onboard = async (req: Request, res: Response): Promise<void> => {
  const doctor = await service.onboardDoctor(hospitalId(req), req.body);
  res.status(201).json({ status: 'success', data: doctor });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listDoctors(
    hospitalId(req),
    req.query as { page?: number; limit?: number; search?: string }
  );
  res.json({ status: 'success', ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const doctor = await service.getDoctor(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: doctor });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const doctor = await service.updateDoctor(param(req, 'id'), hospitalId(req), req.body);
  res.json({ status: 'success', data: doctor });
};

export const deactivate = async (req: Request, res: Response): Promise<void> => {
  await service.deactivateDoctor(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', message: 'Doctor deactivated' });
};

export const getSchedule = async (req: Request, res: Response): Promise<void> => {
  const schedule = await service.getSchedule(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: schedule });
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  const result = await service.updateSchedule(param(req, 'id'), hospitalId(req), req.body);
  res.json({ status: 'success', data: result });
};
