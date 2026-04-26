import { Request, Response } from 'express';
import * as service from './patients.service';
import { param, hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';

export const register = async (req: Request, res: Response): Promise<void> => {
  const patient = await service.registerPatient(hospitalId(req), req.body);
  res.status(201).json({ status: 'success', data: patient });
};

export const bulkRegister = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('CSV file is required (form field "file")', 400);
  const result = await service.bulkRegisterPatients(hospitalId(req), req.file.buffer);
  res.status(201).json({ status: 'success', data: result });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listPatients(
    hospitalId(req),
    req.query as { page?: number; limit?: number; search?: string }
  );
  res.json({ status: 'success', ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const patient = await service.getPatient(param(req, 'id'), hospitalId(req));
  if (req.user?.role === Role.PATIENT && patient.userId !== req.user.id) {
    throw new AppError('Access denied', 403);
  }
  res.json({ status: 'success', data: patient });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const patient = await service.updatePatient(param(req, 'id'), hospitalId(req), req.body);
  res.json({ status: 'success', data: patient });
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  const sessions = await service.getPatientSessions(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: sessions });
};

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  const notes = await service.getPatientNotes(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: notes });
};

export const getTimeline = async (req: Request, res: Response): Promise<void> => {
  const timeline = await service.getPatientTimeline(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: timeline });
};
