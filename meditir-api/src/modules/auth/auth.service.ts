import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiresAt,
} from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';
import type { RegisterHospitalInput, LoginInput } from './auth.schema';
import { sendOnboardingEmail } from '../../services/email.service';

export const registerHospital = async (data: RegisterHospitalInput) => {
  const existingSlug = await prisma.hospital.findUnique({
    where: { slug: data.hospitalSlug },
  });
  if (existingSlug) throw new AppError('Hospital slug already taken', 409);

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.adminEmail },
  });
  if (existingEmail) throw new AppError('Admin email already registered', 409);

  const passwordHash = await hashPassword(data.adminPassword);

  const result = await prisma.$transaction(async (tx) => {
    const hospital = await tx.hospital.create({
      data: {
        name: data.hospitalName,
        slug: data.hospitalSlug,
        email: data.hospitalEmail,
      },
    });

    const user = await tx.user.create({
      data: {
        email: data.adminEmail,
        passwordHash,
        role: Role.HOSPITAL_ADMIN,
        hospitalId: hospital.id,
      },
    });

    await tx.adminProfile.create({
      data: {
        userId: user.id,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
      },
    });

    return { hospital, user };
  });

  // Send onboarding email — fire and forget, don't block registration
  sendOnboardingEmail({
    adminEmail: data.adminEmail,
    adminFirstName: data.adminFirstName,
    hospitalName: data.hospitalName,
    hospitalSlug: data.hospitalSlug,
  }).catch((err) => console.error('[email] Failed to send onboarding email:', err));

  return result;
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { hospital: { select: { slug: true, name: true, isActive: true } } },
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await comparePassword(data.password, user.passwordHash);
  if (!isValid) throw new AppError('Invalid credentials', 401);

  if (user.hospitalId && !user.hospital?.isActive) {
    throw new AppError('Your hospital account is inactive. Contact support.', 403);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    hospitalId: user.hospitalId,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });
    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        hospitalId: user.hospitalId,
        action: 'LOGIN',
        resource: 'User',
        resourceId: user.id,
      },
    });
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
      hospital: user.hospital,
    },
  };
};

export const refreshTokens = async (token: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token expired or revoked', 401);
  }

  if (!stored.user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  const newPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    hospitalId: payload.hospitalId,
  };

  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  // Rotate: revoke old, issue new
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    await tx.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (token: string, userId: string) => {
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: { token, userId },
      data: { revokedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resource: 'User',
        resourceId: userId,
      },
    });
  });
};
