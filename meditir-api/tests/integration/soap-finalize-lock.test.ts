import request from 'supertest';
import { createApp } from '../../src/app';
import {
  createHospital,
  createDoctor,
  createPatient,
  createFinalizedSession,
  tokenFor,
  bearer,
} from '../helpers/factories';
import { Role } from '../../src/types/enums';

const app = createApp();
const base = '/api/v1';

// Clinical-integrity invariant: a FINALIZED (signed) SOAP note must never be
// regenerated. The guard runs before any Claude call, so this asserts purely
// on the 400 without needing the AI key.
describe('SOAP note finalize lock', () => {
  it('refuses to regenerate a FINALIZED note (400)', async () => {
    const hosp = await createHospital();
    const { user: docUser, doctor } = await createDoctor(hosp.id);
    const { patient } = await createPatient(hosp.id);
    const session = await createFinalizedSession({
      hospitalId: hosp.id,
      doctorId: doctor.id,
      patientId: patient.id,
    });

    const res = await request(app)
      .post(`${base}/soap-notes/generate`)
      .set(bearer(tokenFor({ ...docUser, role: Role.DOCTOR })))
      .set('X-Hospital-Slug', hosp.slug)
      .send({ sessionId: session.id });

    expect(res.status).toBe(400);
    expect(String(res.body.message)).toMatch(/finaliz/i);
  });
});
