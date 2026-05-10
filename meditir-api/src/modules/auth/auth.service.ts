import { randomBytes, createHash } from 'crypto';
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
import { sendOnboardingEmail, sendPasswordResetEmail } from '../../services/email.service';

// 60 minutes — long enough for users who hit the link from a different
// device, short enough that an unused link can't sit forever in an inbox.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

// Best-effort lookup of a human first name for the reset email greeting.
// Patient → Doctor → AdminProfile, whichever exists first.
const findFirstName = async (userId: string): Promise<string | null> => {
  const [doc, pat, admin] = await Promise.all([
    prisma.doctor.findUnique({ where: { userId }, select: { firstName: true } }),
    prisma.patient.findUnique({ where: { userId }, select: { firstName: true } }),
    prisma.adminProfile.findUnique({ where: { userId }, select: { firstName: true } }),
  ]);
  return doc?.firstName ?? pat?.firstName ?? admin?.firstName ?? null;
};

// Always returns void. Whether the email exists or not, the caller gets the
// same response — prevents using this endpoint to enumerate registered
// accounts. Email send is fire-and-forget so a slow Resend call doesn't
// reveal account existence via response timing either.
export const requestPasswordReset = async (email: string) => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, isActive: true },
  });
  if (!user || !user.isActive) return;

  // Plaintext token goes in the URL; only the hash is persisted so a DB
  // read can't be replayed against the reset endpoint.
  const plaintext = randomBytes(32).toString('hex');
  const tokenHash = sha256(plaintext);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const appUrl = process.env.APP_URL || 'https://meditir.com';
  const resetUrl = `${appUrl}/reset-password?token=${plaintext}`;

  // Don't await — we don't want response time to leak account existence.
  // Errors are logged via the email service's own console output.
  findFirstName(user.id)
    .then((firstName) =>
      sendPasswordResetEmail({
        to: user.email,
        firstName,
        resetUrl,
        expiresInMinutes: Math.floor(RESET_TOKEN_TTL_MS / 60000),
      }),
    )
    .catch((err) =>
      console.error('[auth] sendPasswordResetEmail failed', { userId: user.id, err: (err as Error).message }),
    );
};

export const resetPassword = async (token: string, newPassword: string) => {
  if (!token || typeof token !== 'string') {
    throw new AppError('Reset link is invalid', 400);
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  const tokenHash = sha256(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!row) throw new AppError('Reset link is invalid or has already been used', 400);
  if (row.usedAt) throw new AppError('Reset link has already been used', 400);
  if (row.expiresAt.getTime() < Date.now()) {
    throw new AppError('Reset link has expired — request a new one', 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    // Revoke every refresh token for this user so other devices have to
    // re-login with the new password.
    prisma.refreshToken.deleteMany({ where: { userId: row.userId } }),
    // Best-effort: invalidate any other outstanding reset tokens for this
    // user so a previously-leaked link can't still be used.
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null, id: { not: row.id } },
      data: { usedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        userId: row.userId,
        action: 'PASSWORD_RESET',
        resource: 'User',
        resourceId: row.userId,
      },
    }),
  ]);
};

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
