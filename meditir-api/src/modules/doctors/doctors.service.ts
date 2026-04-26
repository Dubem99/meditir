import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';
import { getPaginationParams, paginate } from '../../utils/pagination';
import { sendDoctorOnboardingEmail } from '../../services/email.service';
import {
  parseCsvBuffer,
  cleanRow,
  generateTempPassword,
  type BulkResult,
  type BulkRowResult,
} from '../../utils/csv';
import { OnboardDoctorSchema } from './doctors.schema';
import type { OnboardDoctorInput, UpdateDoctorInput, UpdateScheduleInput } from './doctors.schema';

export const onboardDoctor = async (hospitalId: string, data: OnboardDoctorInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new AppError('Email already registered', 409);

  const existingLicense = await prisma.doctor.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });
  if (existingLicense) throw new AppError('License number already registered', 409);

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { name: true },
  });

  const passwordHash = await hashPassword(data.password);

  const doctor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.DOCTOR,
        hospitalId,
      },
    });

    return tx.doctor.create({
      data: {
        userId: user.id,
        hospitalId,
        firstName: data.firstName,
        lastName: data.lastName,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        gender: data.gender,
        phone: data.phone,
        bio: data.bio,
        preferredDialect: data.preferredDialect,
      },
      include: { user: { select: { email: true, role: true } } },
    });
  });

  // Fire-and-forget welcome email — includes temporary password so the new doctor
  // can log in immediately. Failures are logged but don't block the response.
  sendDoctorOnboardingEmail({
    doctorEmail: data.email,
    doctorFirstName: data.firstName,
    doctorLastName: data.lastName,
    specialization: data.specialization,
    hospitalName: hospital?.name ?? 'your hospital',
    temporaryPassword: data.password,
  }).catch((err) => console.error('[email] Failed to send doctor onboarding email:', err));

  return doctor;
};

// Doctor onboarding via CSV. Each row becomes its own transaction so a single
// bad row (duplicate license, invalid field) doesn't roll back the whole batch.
// Password is optional in CSV — when blank we generate one and surface it back
// to the admin (in addition to emailing the doctor) so they can hand it out manually.
export const bulkOnboardDoctors = async (
  hospitalId: string,
  csvBuffer: Buffer
): Promise<BulkResult> => {
  const rows = parseCsvBuffer(csvBuffer);
  const results: BulkRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // +2 because row 1 is the header in the source CSV
    const cleaned = cleanRow(rows[i]);
    const email = cleaned.email ?? '';

    try {
      const generatedPassword = cleaned.password ? undefined : generateTempPassword();
      const candidate = {
        email: cleaned.email,
        password: cleaned.password ?? generatedPassword,
        firstName: cleaned.firstName,
        lastName: cleaned.lastName,
        specialization: cleaned.specialization,
        licenseNumber: cleaned.licenseNumber,
        gender: cleaned.gender,
        phone: cleaned.phone,
        bio: cleaned.bio,
        preferredDialect: cleaned.preferredDialect,
      };

      const parsed = OnboardDoctorSchema.safeParse(candidate);
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const message = Object.entries(fieldErrors)
          .map(([f, msgs]) => `${f}: ${msgs?.join(', ')}`)
          .join('; ');
        results.push({ row: rowNumber, email, status: 'error', error: message });
        continue;
      }

      const doctor = await onboardDoctor(hospitalId, parsed.data);
      results.push({
        row: rowNumber,
        email,
        status: 'success',
        id: doctor.id,
        ...(generatedPassword && { generatedPassword }),
      });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Unexpected error';
      results.push({ row: rowNumber, email, status: 'error', error: message });
    }
  }

  return {
    totalRows: rows.length,
    successful: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'error').length,
    results,
  };
};

export const listDoctors = async (
  hospitalId: string,
  query: { page?: number; limit?: number; search?: string }
) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = {
    hospitalId,
    ...(query.search && {
      OR: [
        { firstName: { contains: query.search, mode: 'insensitive' as const } },
        { lastName: { contains: query.search, mode: 'insensitive' as const } },
        { specialization: { contains: query.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [doctors, total] = await prisma.$transaction([
    prisma.doctor.findMany({
      where,
      skip,
      take: limit,
      include: { user: { select: { email: true, lastLoginAt: true } }, schedules: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.doctor.count({ where }),
  ]);

  return paginate(doctors, total, page, limit);
};

export const getDoctor = async (id: string, hospitalId?: string) => {
  const doctor = await prisma.doctor.findFirst({
    where: { id, ...(hospitalId && { hospitalId }) },
    include: {
      user: { select: { email: true, lastLoginAt: true } },
      schedules: true,
    },
  });
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};

export const updateDoctor = async (id: string, hospitalId: string, data: UpdateDoctorInput) => {
  const doctor = await prisma.doctor.findFirst({ where: { id, hospitalId } });
  if (!doctor) throw new AppError('Doctor not found', 404);

  // When toggling availability, keep user.isActive in sync
  if (typeof data.isAvailable === 'boolean') {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: doctor.userId }, data: { isActive: data.isAvailable } });
      return tx.doctor.update({ where: { id }, data });
    });
  }

  return prisma.doctor.update({ where: { id }, data });
};

export const deactivateDoctor = async (id: string, hospitalId: string) => {
  const doctor = await prisma.doctor.findFirst({ where: { id, hospitalId } });
  if (!doctor) throw new AppError('Doctor not found', 404);
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: doctor.userId }, data: { isActive: false } });
    return tx.doctor.update({ where: { id }, data: { isAvailable: false } });
  });
};

export const getSchedule = async (doctorId: string, hospitalId: string) => {
  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, hospitalId } });
  if (!doctor) throw new AppError('Doctor not found', 404);
  return prisma.doctorSchedule.findMany({ where: { doctorId }, orderBy: { dayOfWeek: 'asc' } });
};

export const updateSchedule = async (
  doctorId: string,
  hospitalId: string,
  data: UpdateScheduleInput
) => {
  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, hospitalId } });
  if (!doctor) throw new AppError('Doctor not found', 404);

  return prisma.$transaction(async (tx) => {
    await tx.doctorSchedule.deleteMany({ where: { doctorId } });
    return tx.doctorSchedule.createMany({
      data: data.slots.map((s) => ({ doctorId, ...s })),
    });
  });
};
