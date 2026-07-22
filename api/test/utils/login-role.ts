import { INestApplication } from '@nestjs/common';
import request from 'supertest';

type LoginResponse = {
  accessToken?: string;
  access_token?: string;
};

export async function loginRole(
  app: INestApplication,
  email: string,
  password = 'Test@12345',
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      email_or_phone: email,
      password,
    })
    .expect((result) => {
      expect([200, 201]).toContain(result.status);
    });

  const body = response.body as LoginResponse;
  const token = body.accessToken ?? body.access_token;

  if (!token) {
    throw new Error(`Login response for ${email} did not contain a token`);
  }

  return token;
}
