import bcrypt from 'bcryptjs';
import { prisma } from '../../src/config/database';
import { signAccessToken } from '../../src/utils/jwt';
import { Role } from '../../src/types/enums';

let n = 0;
const uniq = () => `${Date.now()}-${++n}`;

export const TEST_PASSWORD = 'TestPass123!';

export async function createHospital(overrides: Partial<{ slug: string; name: string }> = {}) {
  const id = uniq();
  return prisma.hospital.create({
    data: {
      name: overrides.name ?? `Hospital ${id}`,
      slug: overrides.slug ?? `hosp-${id}`,
      email: `hospital-${id}@example.ng`,
    },
  });
}

export async function createUser(role: Role, hospitalId: string | null) {
  const id = uniq();
  return prisma.user.create({
    data: {
      email: `user-${id}@example.ng`,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
      role,
      hospitalId,
    },
  });
}

export async function createDoctor(hospitalId: string) {
  const user = await createUser(Role.DOCTOR, hospitalId);
  const id = uniq();
  const doctor = await prisma.doctor.create({
    data: {
      userId: user.id,
      hospitalId,
      firstName: 'Doc',
      lastName: id,
      specialization: 'General',
      licenseNumber: `LIC-${id}`,
    },
  });
  return { user, doctor };
}

export async function createPatient(hospitalId: string) {
  const user = await createUser(Role.PATIENT, hospitalId);
  const id = uniq();
  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      hospitalId,
      firstName: 'Pat',
      lastName: id,
    },
  });
  return { user, patient };
}

export async function createFinalizedSession(opts: {
  hospitalId: string;
  doctorId: string;
  patientId: string;
}) {
  const session = await prisma.consultationSession.create({
    data: {
      hospitalId: opts.hospitalId,
      doctorId: opts.doctorId,
      patientId: opts.patientId,
      status: 'COMPLETED',
      scheduledAt: new Date(),
    },
  });
  await prisma.sOAPNote.create({
    data: {
      sessionId: session.id,
      hospitalId: opts.hospitalId,
      patientId: opts.patientId,
      subjective: 'S',
      objective: 'O',
      assessment: 'A',
      plan: 'P',
      status: 'FINALIZED',
    },
  });
  return session;
}

// Prisma generates its own Role enum type, structurally identical to the
// app's src/types/enums Role. Accept either and bridge with a cast.
export function tokenFor(user: { id: string; email: string; role: string; hospitalId: string | null }) {
  return signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    hospitalId: user.hospitalId,
  });
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
