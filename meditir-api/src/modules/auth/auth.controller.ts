import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.registerHospital(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Hospital and admin account created successfully',
    data: { hospitalId: result.hospital.id, userId: result.user.id },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    status: 'success',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    res.status(401).json({ status: 'error', message: 'No refresh token provided' });
    return;
  }

  const tokens = await authService.refreshTokens(token);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ status: 'success', data: { accessToken: tokens.accessToken } });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token && req.user) {
    await authService.logout(token, req.user.id);
  }
  res.clearCookie('refreshToken');
  res.json({ status: 'success', message: 'Logged out successfully' });
};

// Always 200, regardless of whether the email exists. The response body and
// timing must not leak account existence.
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const email = (req.body?.email ?? '').toString();
  await authService.requestPasswordReset(email);
  res.json({
    status: 'success',
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const token = (req.body?.token ?? '').toString();
  const newPassword = (req.body?.newPassword ?? '').toString();
  await authService.resetPassword(token, newPassword);
  res.json({
    status: 'success',
    message: 'Password updated. Sign in with your new password.',
  });
};
