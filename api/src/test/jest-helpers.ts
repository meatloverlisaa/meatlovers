/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

export function createControllerTestModule<T>(opts: {
  controllers: any[];
  providers?: any[];
}) {
  return Test.createTestingModule({
    controllers: opts.controllers,
    providers: opts.providers ?? [],
  })
    .useMocker(() => ({}))
    .compile();
}

export async function createAppForE2E(
  appModule: any,
): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [appModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
