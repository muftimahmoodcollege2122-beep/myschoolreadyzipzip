import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('POST /auth/login — rejects bad credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-tenant-slug', 'test-school')
      .send({ email: 'nobody@test.com', password: 'wrong' })
      .expect(401);
  });

  it('POST /auth/login — rejects missing body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-tenant-slug', 'test-school')
      .send({})
      .expect(400);
  });

  it('GET /auth/me — rejects unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('GET /auth/me — rejects expired token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });
});
