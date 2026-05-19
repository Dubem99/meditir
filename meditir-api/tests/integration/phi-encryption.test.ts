import { prisma } from '../../src/config/database';
import { createHospital, createDoctor, createPatient } from '../helpers/factories';

// Proves encryption is at rest: the raw column holds ciphertext while the
// Prisma client transparently returns plaintext.
describe('PHI encryption at rest', () => {
  it('stores SOAP note fields encrypted but reads them back decrypted', async () => {
    const hosp = await createHospital();
    const { doctor } = await createDoctor(hosp.id);
    const { patient } = await createPatient(hosp.id);
    const session = await prisma.consultationSession.create({
      data: {
        hospitalId: hosp.id,
        doctorId: doctor.id,
        patientId: patient.id,
        status: 'COMPLETED',
        scheduledAt: new Date(),
      },
    });

    const SUBJECTIVE = 'Patient reports persistent fever and chills for 3 days.';
    const note = await prisma.sOAPNote.create({
      data: {
        sessionId: session.id,
        hospitalId: hosp.id,
        patientId: patient.id,
        subjective: SUBJECTIVE,
        objective: 'Temp 38.9C',
        assessment: 'Suspected malaria',
        plan: 'Order MP, start Coartem',
        status: 'AI_GENERATED',
      },
    });

    // Raw column = ciphertext envelope.
    const raw = await prisma.$queryRawUnsafe<Array<{ subjective: string }>>(
      `SELECT subjective FROM soap_notes WHERE id = $1`,
      note.id,
    );
    expect(raw[0].subjective.startsWith('enc:v1:')).toBe(true);
    expect(raw[0].subjective).not.toContain('fever');

    // Prisma read = transparent plaintext.
    const read = await prisma.sOAPNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(read.subjective).toBe(SUBJECTIVE);

    // Nested include is decrypted too.
    const viaSession = await prisma.consultationSession.findUniqueOrThrow({
      where: { id: session.id },
      include: { soapNote: true },
    });
    expect(viaSession.soapNote?.assessment).toBe('Suspected malaria');
  });
});
