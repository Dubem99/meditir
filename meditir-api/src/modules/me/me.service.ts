// Self-service profile module — every authenticated user (DOCTOR, PATIENT,
// HOSPITAL_ADMIN, SUPER_ADMIN) reads + updates their own profile here. The
// role-specific tables (Doctor / Patient / AdminProfile) are joined off the
// User row by the userId from the JWT so a user can never modify someone
// else's profile via this module.
//
// Things deliberately NOT editable here:
//   - email           (would need a verification flow)
//   - role            (admin-only operation; live elsewhere)
//   - hospitalId      (hospital reassignment is admin-only)
//   - licenseNumber   (doctor regulatory field; admin-only)
//   - medicalRecordNo (patient identifier set at registration)

import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { Role, Gender, Dialect } from '../../types/enums';

const isString = (v: unknown): v is string => typeof v === 'string';
const isOptString = (v: unknown): v is string | undefined => v === undefined || typeof v === 'string';
const isOptNullableString = (v: unknown): v is string | null | undefined =>
  v === undefined || v === null || typeof v === 'string';

const inEnum = <T extends Record<string, string>>(e: T) => (v: unknown): v is T[keyof T] =>
  typeof v === 'string' && Object.values(e).includes(v as T[keyof T]);

const isOptStringArray = (v: unknown): v is string[] | undefined =>
  v === undefined || (Array.isArray(v) && v.every((s) => typeof s === 'string'));

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      hospitalId: true,
      hospital: { select: { name: true, slug: true } },
      doctor: {
        select: {
          id: true, firstName: true, lastName: true, specialization: true,
          licenseNumber: true, gender: true, phone: true, bio: true, avatarUrl: true,
          preferredDialect: true, isAvailable: true,
        },
      },
      patient: {
        select: {
          id: true, firstName: true, lastName: true, medicalRecordNo: true,
          dateOfBirth: true, gender: true, bloodGroup: true, genotype: true,
          phone: true, address: true, nextOfKin: true, nextOfKinPhone: true,
          avatarUrl: true, allergies: true, chronicConditions: true, preferTTS: true,
        },
      },
      adminProfile: {
        select: { id: true, firstName: true, lastName: true, phone: true, department: true, avatarUrl: true },
      },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// PATCH body is a flat object — server filters to the fields valid for the
// caller's role. Unknown keys are silently ignored so a stale client won't
// break, but anything sensitive (email, licenseNumber, etc.) is filtered.
type ProfilePatch = Record<string, unknown>;

export const updateMyProfile = async (userId: string, role: Role, body: ProfilePatch) => {
  if (role === Role.DOCTOR) {
    const data: Record<string, unknown> = {};
    if (isString(body.firstName) && body.firstName.trim()) data.firstName = body.firstName.trim();
    if (isString(body.lastName) && body.lastName.trim()) data.lastName = body.lastName.trim();
    if (isString(body.specialization) && body.specialization.trim()) data.specialization = body.specialization.trim();
    if (isOptNullableString(body.phone)) data.phone = body.phone || null;
    if (isOptNullableString(body.bio)) data.bio = body.bio || null;
    if (body.gender === null) data.gender = null;
    else if (inEnum(Gender)(body.gender)) data.gender = body.gender;
    if (inEnum(Dialect)(body.preferredDialect)) data.preferredDialect = body.preferredDialect;
    if (typeof body.isAvailable === 'boolean') data.isAvailable = body.isAvailable;

    if (Object.keys(data).length === 0) {
      throw new AppError('No editable fields in request', 400);
    }
    await prisma.doctor.update({ where: { userId }, data });
    return getMyProfile(userId);
  }

  if (role === Role.PATIENT) {
    const data: Record<string, unknown> = {};
    if (isString(body.firstName) && body.firstName.trim()) data.firstName = body.firstName.trim();
    if (isString(body.lastName) && body.lastName.trim()) data.lastName = body.lastName.trim();
    if (body.dateOfBirth === null) data.dateOfBirth = null;
    else if (isString(body.dateOfBirth)) {
      const d = new Date(body.dateOfBirth);
      if (isNaN(d.getTime())) throw new AppError('Invalid dateOfBirth', 400);
      data.dateOfBirth = d;
    }
    if (body.gender === null) data.gender = null;
    else if (inEnum(Gender)(body.gender)) data.gender = body.gender;
    if (isOptNullableString(body.bloodGroup)) data.bloodGroup = body.bloodGroup || null;
    if (isOptNullableString(body.genotype)) data.genotype = body.genotype || null;
    if (isOptNullableString(body.phone)) data.phone = body.phone || null;
    if (isOptNullableString(body.address)) data.address = body.address || null;
    if (isOptNullableString(body.nextOfKin)) data.nextOfKin = body.nextOfKin || null;
    if (isOptNullableString(body.nextOfKinPhone)) data.nextOfKinPhone = body.nextOfKinPhone || null;
    if (isOptStringArray(body.allergies)) data.allergies = body.allergies;
    if (isOptStringArray(body.chronicConditions)) data.chronicConditions = body.chronicConditions;
    if (typeof body.preferTTS === 'boolean') data.preferTTS = body.preferTTS;

    if (Object.keys(data).length === 0) {
      throw new AppError('No editable fields in request', 400);
    }
    await prisma.patient.update({ where: { userId }, data });
    return getMyProfile(userId);
  }

  if (role === Role.HOSPITAL_ADMIN || role === Role.SUPER_ADMIN) {
    const data: Record<string, unknown> = {};
    if (isString(body.firstName) && body.firstName.trim()) data.firstName = body.firstName.trim();
    if (isString(body.lastName) && body.lastName.trim()) data.lastName = body.lastName.trim();
    if (isOptNullableString(body.phone)) data.phone = body.phone || null;
    if (isOptNullableString(body.department)) data.department = body.department || null;

    if (Object.keys(data).length === 0) {
      throw new AppError('No editable fields in request', 400);
    }
    await prisma.adminProfile.update({ where: { userId }, data });
    return getMyProfile(userId);
  }

  throw new AppError('Profile editing not supported for this role', 400);
};

export const changeMyPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  if (!isString(currentPassword) || !currentPassword) {
    throw new AppError('Current password is required', 400);
  }
  if (!isString(newPassword) || newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }
  if (newPassword === currentPassword) {
    throw new AppError('New password must be different from the current one', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw new AppError('User not found', 404);

  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) throw new AppError('Current password is incorrect', 401);

  const hash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

  // Best-effort: kill all refresh tokens so re-login is required on other
  // devices after a password change.
  await prisma.refreshToken
    .deleteMany({ where: { userId } })
    .catch(() => {});
};
