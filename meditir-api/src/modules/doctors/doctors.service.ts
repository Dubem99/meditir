import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';
import { getPaginationParams, paginate } from '../../utils/pagination';
import type { OnboardDoctorInput, UpdateDoctorInput, UpdateScheduleInput } from './doctors.schema';

export const onboardDoctor = async (hospitalId: string, data: OnboardDoctorInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new AppError('Email already registered', 409);

  const existingLicense = await prisma.doctor.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });
  if (existingLicense) throw new AppError('License number already registered', 409);

  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.DOCTOR,
        hospitalId,
      },
    });

    const doctor = await tx.doctor.create({
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

    return doctor;
  });
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
