import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';
import { getPaginationParams, paginate } from '../../utils/pagination';
import type { RegisterPatientInput, UpdatePatientInput } from './patients.schema';

export const registerPatient = async (hospitalId: string, data: RegisterPatientInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new AppError('Email already registered', 409);

  if (data.medicalRecordNo) {
    const existing = await prisma.patient.findUnique({
      where: { medicalRecordNo: data.medicalRecordNo },
    });
    if (existing) throw new AppError('Medical record number already exists', 409);
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: data.email, passwordHash, role: Role.PATIENT, hospitalId },
    });

    const { email: _e, password: _p, ...patientData } = data as RegisterPatientInput & {
      password: string;
      email: string;
    };

    return tx.patient.create({
      data: { userId: user.id, hospitalId, ...patientData },
      include: { user: { select: { email: true } } },
    });
  });
};

export const listPatients = async (
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
        { medicalRecordNo: { contains: query.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [patients, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  return paginate(patients, total, page, limit);
};

export const getPatient = async (id: string, hospitalId?: string) => {
  const patient = await prisma.patient.findFirst({
    where: { id, ...(hospitalId && { hospitalId }) },
    include: { user: { select: { email: true, lastLoginAt: true } } },
  });
  if (!patient) throw new AppError('Patient not found', 404);
  return patient;
};

export const updatePatient = async (id: string, hospitalId: string, data: UpdatePatientInput) => {
  const patient = await prisma.patient.findFirst({ where: { id, hospitalId } });
  if (!patient) throw new AppError('Patient not found', 404);
  return prisma.patient.update({ where: { id }, data });
};

export const getPatientSessions = async (patientId: string, hospitalId: string) => {
  return prisma.consultationSession.findMany({
    where: { patientId, hospitalId },
    include: {
      doctor: { select: { firstName: true, lastName: true, specialization: true } },
      soapNote: { select: { id: true, status: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });
};

export const getPatientNotes = async (patientId: string, hospitalId: string) => {
  return prisma.sOAPNote.findMany({
    where: { patientId, hospitalId },
    include: {
      session: {
        include: {
          doctor: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
