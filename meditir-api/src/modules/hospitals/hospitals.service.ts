import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { getPaginationParams, paginate } from '../../utils/pagination';
import type { CreateHospitalInput, UpdateHospitalInput } from './hospitals.schema';

export const createHospital = async (data: CreateHospitalInput) => {
  const existing = await prisma.hospital.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError('Hospital slug already taken', 409);

  return prisma.hospital.create({ data });
};

export const listHospitals = async (query: { page?: number; limit?: number; search?: string }) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { slug: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [hospitals, total] = await prisma.$transaction([
    prisma.hospital.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.hospital.count({ where }),
  ]);

  return paginate(hospitals, total, page, limit);
};

export const getHospital = async (id: string) => {
  const hospital = await prisma.hospital.findUnique({ where: { id } });
  if (!hospital) throw new AppError('Hospital not found', 404);
  return hospital;
};

export const updateHospital = async (id: string, data: UpdateHospitalInput) => {
  const hospital = await prisma.hospital.findUnique({ where: { id } });
  if (!hospital) throw new AppError('Hospital not found', 404);
  return prisma.hospital.update({ where: { id }, data });
};

export const deactivateHospital = async (id: string) => {
  const hospital = await prisma.hospital.findUnique({ where: { id } });
  if (!hospital) throw new AppError('Hospital not found', 404);
  return prisma.hospital.update({ where: { id }, data: { isActive: false } });
};

export const getHospitalStats = async (id: string) => {
  const [doctors, patients, sessions] = await prisma.$transaction([
    prisma.doctor.count({ where: { hospitalId: id, isAvailable: true } }),
    prisma.patient.count({ where: { hospitalId: id } }),
    prisma.consultationSession.count({ where: { hospitalId: id } }),
  ]);
  return { activeDoctors: doctors, totalPatients: patients, totalSessions: sessions };
};
