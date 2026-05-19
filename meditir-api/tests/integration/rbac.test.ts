import request from 'supertest';
import { createApp } from '../../src/app';
import { createHospital, createUser, tokenFor, bearer } from '../helpers/factories';
import { Role } from '../../src/types/enums';

const app = createApp();
const base = '/api/v1';

describe('RBAC enforcement', () => {
  it('forbids a HOSPITAL_ADMIN from the SUPER_ADMIN-only create-hospital route (403)', async () => {
    const hosp = await createHospital();
    const admin = await createUser(Role.HOSPITAL_ADMIN, hosp.id);

    const res = await request(app)
      .post(`${base}/hospitals`)
      .set(bearer(tokenFor(admin)))
      .send({ name: 'Sneaky Hospital', slug: 'sneaky', email: 'x@example.ng' });

    expect(res.status).toBe(403);
  });

  it('forbids a DOCTOR from listing all users (SUPER_ADMIN only) (403)', async () => {
    const hosp = await createHospital();
    const doc = await createUser(Role.DOCTOR, hosp.id);

    const res = await request(app)
      .get(`${base}/admin/users`)
      .set(bearer(tokenFor(doc)))
      .set('X-Hospital-Slug', hosp.slug);

    expect(res.status).toBe(403);
  });
});
