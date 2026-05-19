import request from 'supertest';
import { createApp } from '../../src/app';

describe('health check', () => {
  it('responds 200 with status ok', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
  });
});
