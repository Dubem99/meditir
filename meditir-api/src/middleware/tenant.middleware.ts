import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { Role } from '../types/enums';

/**
 * Resolves the hospital tenant from X-Hospital-Slug header.
 * SuperAdmins bypass tenant scoping.
 * All other roles must belong to the resolved hospital.
 */
export const resolveTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  // SuperAdmins have no hospital scope
  if (req.user?.role === Role.SUPER_ADMIN) {
    return next();
  }

  const slug = req.headers['x-hospital-slug'] as string | undefined;

  if (!slug) {
    // Fall back to the user's own hospitalId if no header
    if (req.user?.hospitalId) {
      req.hospitalId = req.user.hospitalId;
      return next();
    }
    return next(new AppError('Hospital context required. Provide X-Hospital-Slug header.', 400));
  }

  try {
    const hospital = await prisma.hospital.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!hospital) {
      return next(new AppError('Hospital not found or inactive', 404));
    }

    // Ensure the authenticated user belongs to this hospital
    if (req.user && req.user.hospitalId !== hospital.id) {
      return next(new AppError('Access denied to this hospital', 403));
    }

    req.hospitalId = hospital.id;
    next();
  } catch (err) {
    next(err);
  }
};
