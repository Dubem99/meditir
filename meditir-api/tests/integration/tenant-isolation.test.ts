import request from 'supertest';
import { createApp } from '../../src/app';
import { createHospital, createDoctor, createPatient, tokenFor, bearer } from '../helpers/factories';
import { Role } from '../../src/types/enums';

const app = createApp();
const base = '/api/v1';

describe('multi-tenant isolation', () => {
  it('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).get(`${base}/patients`);
    expect(res.status).toBe(401);
  });

  it("denies access when the X-Hospital-Slug points at another hospital (403)", async () => {
    const [hospA, hospB] = await Promise.all([createHospital(), createHospital()]);
    const { user: docA } = await createDoctor(hospA.id);
    const token = tokenFor({ ...docA, role: Role.DOCTOR });

    const res = await request(app)
      .get(`${base}/patients`)
      .set(bearer(token))
      .set('X-Hospital-Slug', hospB.slug);

    expect(res.status).toBe(403);
  });

  it('scopes patient listing to the doctor own hospital only', async () => {
    const [hospA, hospB] = await Promise.all([createHospital(), createHospital()]);
    const { user: docA } = await createDoctor(hospA.id);
    await createPatient(hospA.id);
    await createPatient(hospA.id);
    await createPatient(hospB.id); // must NOT be visible to hospital A

    const res = await request(app)
      .get(`${base}/patients`)
      .set(bearer(tokenFor({ ...docA, role: Role.DOCTOR })))
      .set('X-Hospital-Slug', hospA.slug);

    expect(res.status).toBe(200);
    const items = res.body.data?.items ?? res.body.data ?? [];
    expect(Array.isArray(items) ? items.length : items).toBe(2);
  });
});
