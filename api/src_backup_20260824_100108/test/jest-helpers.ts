/* eslint-disable @typescript-eslint/no-unused-vars */

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
