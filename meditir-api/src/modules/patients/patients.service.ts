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

/**
 * Aggregate timeline for the Patient History page — returns one payload
 * with everything the UI needs: patient details, every session ordered
 * by date, all SOAP notes with preview text, deduped active problems,
 * and currently-ordered medications.
 */
export const getPatientTimeline = async (patientId: string, hospitalId: string) => {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, hospitalId },
    include: { user: { select: { email: true, lastLoginAt: true } } },
  });
  if (!patient) throw new AppError('Patient not found', 404);

  const [sessions, notes, allProblems, allOrders] = await Promise.all([
    prisma.consultationSession.findMany({
      where: { patientId, hospitalId },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
        soapNote: { select: { id: true, status: true, assessment: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.sOAPNote.findMany({
      where: { patientId, hospitalId },
      include: {
        session: {
          select: {
            id: true,
            scheduledAt: true,
            endedAt: true,
            doctor: { select: { firstName: true, lastName: true, specialization: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.problem.findMany({
      where: { patientId, hospitalId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { patientId, hospitalId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Dedupe problems by normalized name, keeping the most recent entry.
  // Problems marked RESOLVED filter out unless there's no active version.
  const problemMap = new Map<string, (typeof allProblems)[number]>();
  for (const p of allProblems) {
    const key = p.name.trim().toLowerCase();
    const existing = problemMap.get(key);
    if (!existing) problemMap.set(key, p);
    else if (existing.status === 'RESOLVED' && p.status !== 'RESOLVED') {
      problemMap.set(key, p);
    }
  }
  const activeProblems = Array.from(problemMap.values()).filter((p) => p.status !== 'RESOLVED');
  const resolvedProblems = Array.from(problemMap.values()).filter((p) => p.status === 'RESOLVED');

  // Current medications = MEDICATION orders that aren't cancelled/completed,
  // deduped by drug name keeping the most recent.
  const medMap = new Map<string, (typeof allOrders)[number]>();
  for (const o of allOrders) {
    if (o.type !== 'MEDICATION') continue;
    if (o.status === 'CANCELLED' || o.status === 'COMPLETED') continue;
    const key = o.name.trim().toLowerCase();
    if (!medMap.has(key)) medMap.set(key, o);
  }
  const currentMedications = Array.from(medMap.values());

  const pendingOrders = allOrders.filter(
    (o) => o.type !== 'MEDICATION' && (o.status === 'PENDING' || o.status === 'ORDERED')
  );

  return {
    patient,
    stats: {
      totalVisits: sessions.length,
      completedVisits: sessions.filter((s) => s.status === 'COMPLETED').length,
      activeProblems: activeProblems.length,
      currentMedications: currentMedications.length,
      firstVisit: sessions.length > 0 ? sessions[sessions.length - 1].scheduledAt : null,
      lastVisit: sessions.length > 0 ? sessions[0].scheduledAt : null,
    },
    sessions,
    notes,
    activeProblems,
    resolvedProblems,
    currentMedications,
    pendingOrders,
  };
};
