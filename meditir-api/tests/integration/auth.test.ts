import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
const base = '/api/v1';

const validHospital = (slug: string) => ({
  hospitalName: 'Test General Hospital',
  hospitalSlug: slug,
  hospitalEmail: `info-${slug}@example.ng`,
  adminEmail: `admin-${slug}@example.ng`,
  adminPassword: 'AdminPass123!',
  adminFirstName: 'Ada',
  adminLastName: 'Admin',
});

describe('hospital onboarding + auth', () => {
  it('registers a hospital and its admin', async () => {
    const res = await request(app).post(`${base}/auth/register`).send(validHospital('alpha-clinic'));
    expect(res.status).toBe(201);
    expect(res.body.data.hospitalId).toBeTruthy();
    expect(res.body.data.userId).toBeTruthy();
  });

  it('rejects a duplicate hospital slug with 409', async () => {
    await request(app).post(`${base}/auth/register`).send(validHospital('dup-clinic'));
    const res = await request(app).post(`${base}/auth/register`).send(validHospital('dup-clinic'));
    expect(res.status).toBe(409);
  });

  it('rejects an invalid registration body with 400', async () => {
    const res = await request(app)
      .post(`${base}/auth/register`)
      .send({ hospitalName: 'X', hospitalSlug: 'Bad Slug!', adminPassword: 'short' });
    expect(res.status).toBe(400);
  });

  it('logs in the admin and returns an access token', async () => {
    await request(app).post(`${base}/auth/register`).send(validHospital('beta-clinic'));
    const res = await request(app)
      .post(`${base}/auth/login`)
      .send({ email: 'admin-beta-clinic@example.ng', password: 'AdminPass123!' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.role).toBe('HOSPITAL_ADMIN');
  });

  it('rejects a wrong password with 401', async () => {
    await request(app).post(`${base}/auth/register`).send(validHospital('gamma-clinic'));
    const res = await request(app)
      .post(`${base}/auth/login`)
      .send({ email: 'admin-gamma-clinic@example.ng', password: 'WrongPass999!' });
    expect(res.status).toBe(401);
  });
});
