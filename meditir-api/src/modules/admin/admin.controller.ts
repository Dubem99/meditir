import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { param } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { getPaginationParams } from '../../utils/pagination';
import { getCorrectionsAnalytics } from './corrections-analytics.service';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const profile = await prisma.adminProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { email: true, lastLoginAt: true } } },
  });
  if (!profile) throw new AppError('Admin profile not found', 404);
  res.json({ status: 'success', data: profile });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { firstName, lastName, phone, department, avatarUrl } = req.body as Record<string, string>;
  const profile = await prisma.adminProfile.update({
    where: { userId: req.user.id },
    data: { firstName, lastName, phone, department, avatarUrl },
  });
  res.json({ status: 'success', data: profile });
};

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPaginationParams(req.query as { page?: number; limit?: number });
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        hospital: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  res.json({ status: 'success', data: users, meta: { total, page, limit } });
};

export const toggleUser = async (req: Request, res: Response): Promise<void> => {
  const userId = param(req, 'id');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: { id: true, email: true, isActive: true },
  });
  res.json({ status: 'success', data: updated });
};

export const correctionsAnalytics = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const raw = Number(req.query.days);
  const windowDays =
    Number.isFinite(raw) ? Math.min(180, Math.max(1, Math.floor(raw))) : 30;

  const data = await getCorrectionsAnalytics(windowDays);

  // Audit-log access to aggregate analytics — even though no PHI is returned,
  // we want a paper trail of who looked at correction data and when.
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'VIEW_CORRECTIONS_ANALYTICS',
      resource: 'AiCorrection',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
      metadata: { windowDays, totalCorrections: data.totalCorrections },
    },
  });

  res.json({ status: 'success', data });
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { page, limit, skip } = getPaginationParams(req.query as { page?: number; limit?: number });

  const where =
    req.user.role === 'SUPER_ADMIN'
      ? {}
      : { hospitalId: req.user.hospitalId ?? undefined };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({ status: 'success', data: logs, meta: { total, page, limit } });
};
