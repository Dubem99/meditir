import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';
import { getPaginationParams, paginate } from '../../utils/pagination';
import type { RegisterPatientInput, UpdatePatientInput } from './patients.schema';

export const registerPatient = async (hospitalId: string, data: RegisterPatientInput) => {
  // Skip duplicate checks on synthetic guest-* emails — those are used by the
  // legacy quick-register flow and will be removed once search-first flow lands.
  const isSyntheticEmail = data.email.startsWith('guest-') && data.email.endsWith('@meditir.internal');

  if (!isSyntheticEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (existingUser) {
      const patient = existingUser.patient;
      throw new AppError(
        patient
          ? `A patient with this email already exists: ${patient.firstName} ${patient.lastName}. Use search to find them instead of creating a duplicate.`
          : 'Email already registered',
        409
      );
    }
  }

  if (data.medicalRecordNo) {
    const existing = await prisma.patient.findUnique({
      where: { medicalRecordNo: data.medicalRecordNo },
    });
    if (existing) {
      throw new AppError(
        `Medical record number already belongs to ${existing.firstName} ${existing.lastName}. Use search to find them instead.`,
        409
      );
    }
  }

  // Soft duplicate check: warn if the same hospital already has a patient with
  // this phone number. Multiple family members may share a phone, so the frontend
  // can resubmit with forceCreate: true to override.
  if (data.phone && !data.forceCreate) {
    const existingByPhone = await prisma.patient.findFirst({
      where: { hospitalId, phone: data.phone },
      select: { id: true, firstName: true, lastName: true, medicalRecordNo: true },
    });
    if (existingByPhone) {
      throw new AppError(
        `A patient with this phone number already exists: ${existingByPhone.firstName} ${existingByPhone.lastName}. If this is the same person, use search to find them. Resubmit with forceCreate: true to proceed anyway.`,
        409,
        { duplicatePatient: existingByPhone }
      );
    }
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: data.email, passwordHash, role: Role.PATIENT, hospitalId },
    });

    const { email: _e, password: _p, forceCreate: _f, ...patientData } = data as RegisterPatientInput & {
      password: string;
      email: string;
      forceCreate?: boolean;
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
        { phone: { contains: query.search, mode: 'insensitive' as const } },
        { user: { email: { contains: query.search, mode: 'insensitive' as const } } },
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
