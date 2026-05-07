import { Request, Response } from 'express';
import * as service from './me.service';
import { AppError } from '../../utils/AppError';

export const get = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const profile = await service.getMyProfile(req.user.id);
  res.json({ status: 'success', data: profile });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const profile = await service.updateMyProfile(req.user.id, req.user.role, req.body ?? {});
  res.json({ status: 'success', data: profile });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { currentPassword, newPassword } = (req.body ?? {}) as {
    currentPassword?: string;
    newPassword?: string;
  };
  await service.changeMyPassword(req.user.id, currentPassword ?? '', newPassword ?? '');
  res.json({ status: 'success', message: 'Password updated. Other sessions have been signed out.' });
};
