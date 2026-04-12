import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { SessionStatus } from '../../types/enums';
import { getPaginationParams, paginate } from '../../utils/pagination';
import type { CreateSessionInput, UpdateSessionInput } from './sessions.schema';

const sessionIncludes = {
  doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      medicalRecordNo: true,
      dateOfBirth: true,
      gender: true,
      bloodGroup: true,
      genotype: true,
      allergies: true,
      chronicConditions: true,
    },
  },
  soapNote: { select: { id: true, status: true } },
};

export const createSession = async (hospitalId: string, data: CreateSessionInput, requestingUserId?: string) => {
  let resolvedDoctorId = data.doctorId;
  if (!resolvedDoctorId) {
    if (!requestingUserId) throw new AppError('doctorId is required', 400);
    const me = await prisma.doctor.findFirst({ where: { userId: requestingUserId, hospitalId } });
    if (!me) throw new AppError('No doctor profile found for this user', 404);
    resolvedDoctorId = me.id;
  }

  const [doctor, patient] = await prisma.$transaction([
    prisma.doctor.findFirst({ where: { id: resolvedDoctorId, hospitalId } }),
    prisma.patient.findFirst({ where: { id: data.patientId, hospitalId } }),
  ]);

  if (!doctor) throw new AppError('Doctor not found in this hospital', 404);
  if (!patient) throw new AppError('Patient not found in this hospital', 404);

  return prisma.consultationSession.create({
    data: {
      hospitalId,
      doctorId: resolvedDoctorId,
      patientId: data.patientId,
      scheduledAt: new Date(data.scheduledAt),
      dialect: data.dialect,
      notes: data.notes,
    },
    include: sessionIncludes,
  });
};

export const listSessions = async (
  hospitalId: string,
  userId: string,
  role: string,
  query: { page?: number; limit?: number; status?: SessionStatus; search?: string }
) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where: Record<string, unknown> = { hospitalId };
  if (query.status) where.status = query.status;
  if (role === 'DOCTOR') {
    const doctor = await prisma.doctor.findFirst({ where: { userId, hospitalId } });
    if (doctor) where.doctorId = doctor.id;
  }
  if (query.search) {
    where.patient = {
      OR: [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ],
    };
  }

  const [sessions, total] = await prisma.$transaction([
    prisma.consultationSession.findMany({
      where,
      skip,
      take: limit,
      include: sessionIncludes,
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.consultationSession.count({ where }),
  ]);

  return paginate(sessions, total, page, limit);
};

export const getSession = async (id: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id, hospitalId },
    include: {
      ...sessionIncludes,
      transcriptions: { orderBy: { startMs: 'asc' } },
    },
  });
  if (!session) throw new AppError('Session not found', 404);
  return session;
};

export const updateSession = async (id: string, hospitalId: string, data: UpdateSessionInput) => {
  const session = await prisma.consultationSession.findFirst({ where: { id, hospitalId } });
  if (!session) throw new AppError('Session not found', 404);
  return prisma.consultationSession.update({ where: { id }, data, include: sessionIncludes });
};

export const startSession = async (id: string, hospitalId: string, doctorUserId: string) => {
  const session = await prisma.consultationSession.findFirst({ where: { id, hospitalId } });
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== SessionStatus.SCHEDULED) {
    throw new AppError('Session is not in SCHEDULED state', 400);
  }

  const doctor = await prisma.doctor.findFirst({ where: { userId: doctorUserId, hospitalId } });
  if (!doctor || doctor.id !== session.doctorId) {
    throw new AppError('Only the assigned doctor can start this session', 403);
  }

  return prisma.consultationSession.update({
    where: { id },
    data: { status: SessionStatus.IN_PROGRESS, startedAt: new Date(), roomToken: uuidv4() },
    include: sessionIncludes,
  });
};

export const endSession = async (id: string, hospitalId: string, doctorUserId: string) => {
  const session = await prisma.consultationSession.findFirst({ where: { id, hospitalId } });
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== SessionStatus.IN_PROGRESS) {
    throw new AppError('Session is not in progress', 400);
  }

  const doctor = await prisma.doctor.findFirst({ where: { userId: doctorUserId, hospitalId } });
  if (!doctor || doctor.id !== session.doctorId) {
    throw new AppError('Only the assigned doctor can end this session', 403);
  }

  return prisma.consultationSession.update({
    where: { id },
    data: { status: SessionStatus.COMPLETED, endedAt: new Date() },
    include: sessionIncludes,
  });
};

export const cancelSession = async (id: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({ where: { id, hospitalId } });
  if (!session) throw new AppError('Session not found', 404);
  if (session.status === SessionStatus.COMPLETED) {
    throw new AppError('Cannot cancel a completed session', 400);
  }
  return prisma.consultationSession.update({
    where: { id },
    data: { status: SessionStatus.CANCELLED },
  });
};

export const handoverSession = async (
  id: string,
  hospitalId: string,
  fromDoctorUserId: string,
  toDoctorId: string,
  handoverNote: string
) => {
  const session = await prisma.consultationSession.findFirst({ where: { id, hospitalId } });
  if (!session) throw new AppError('Session not found', 404);

  const fromDoctor = await prisma.doctor.findFirst({ where: { userId: fromDoctorUserId, hospitalId } });
  if (!fromDoctor || fromDoctor.id !== session.doctorId) {
    throw new AppError('Only the current session doctor can hand over', 403);
  }

  const toDoctor = await prisma.doctor.findFirst({ where: { id: toDoctorId, hospitalId, isAvailable: true } });
  if (!toDoctor) throw new AppError('Target doctor not found or unavailable', 404);

  return prisma.consultationSession.update({
    where: { id },
    data: {
      doctorId: toDoctorId,
      handoverNote,
      originalDoctorId: session.originalDoctorId || session.doctorId,
    },
    include: sessionIncludes,
  });
};

export const getAnalytics = async (hospitalId: string) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sessions = await prisma.consultationSession.findMany({
    where: { hospitalId, scheduledAt: { gte: thirtyDaysAgo } },
    select: { scheduledAt: true, status: true },
    orderBy: { scheduledAt: 'asc' },
  });

  const byDate: Record<string, { total: number; completed: number }> = {};
  for (const s of sessions) {
    const key = s.scheduledAt.toISOString().slice(0, 10);
    if (!byDate[key]) byDate[key] = { total: 0, completed: 0 };
    byDate[key].total++;
    if (s.status === 'COMPLETED') byDate[key].completed++;
  }

  return Object.entries(byDate).map(([date, counts]) => ({ date, ...counts }));
};
