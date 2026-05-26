import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * CRITICAL: Verifies that tenant data isolation is enforced.
 * A user from tenant-a must NEVER access data from tenant-b.
 */
describe('Tenant Isolation (Security)', () => {
  let app: INestApplication;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    await app.init();

    // Login as tenant A admin
    const resA = await request(app.getHttpServer())
      .post('/auth/login').set('x-tenant-slug', 'school-a')
      .send({ email: process.env.TEST_ADMIN_A_EMAIL, password: process.env.TEST_ADMIN_A_PASS });
    tokenA = resA.body.accessToken;

    // Login as tenant B admin
    const resB = await request(app.getHttpServer())
      .post('/auth/login').set('x-tenant-slug', 'school-b')
      .send({ email: process.env.TEST_ADMIN_B_EMAIL, password: process.env.TEST_ADMIN_B_PASS });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('Tenant A token cannot read Tenant B students', async () => {
    // Use tenant-a token but request tenant-b slug — must return empty or 403
    const res = await request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-slug', 'school-b');
    // Either 403 or empty result — never tenant-b data
    if (res.status === 200) {
      expect(res.body.data?.length ?? 0).toBe(0);
    } else {
      expect([401, 403]).toContain(res.status);
    }
  });

  it('Cross-tenant student lookup returns 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app.getHttpServer())
      .get(`/students/${fakeId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-slug', 'school-a');
    expect([404, 403]).toContain(res.status);
  });
});
