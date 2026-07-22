import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './utils/create-e2e-app';
import { loginRole } from './utils/login-role';

describe('Role authorization', () => {
  let app: INestApplication;
  let adminToken: string;
  let managerToken: string;
  let waiterToken: string;
  let cashierToken: string;
  let chefToken: string;
  let barmanToken: string;
  let storekeeperToken: string;
  let accountantToken: string;
  let dispatcherToken: string;

  beforeAll(async () => {
    app = await createE2EApp();

    adminToken = await loginRole(app, 'admin@test.local');
    managerToken = await loginRole(app, 'manager@test.local');
    waiterToken = await loginRole(app, 'waiter@test.local');
    cashierToken = await loginRole(app, 'cashier@test.local');
    chefToken = await loginRole(app, 'chef@test.local');
    barmanToken = await loginRole(app, 'barman@test.local');
    storekeeperToken = await loginRole(
      app,
      'storekeeper@test.local',
    );
    accountantToken = await loginRole(
      app,
      'accountant@test.local',
    );
    dispatcherToken = await loginRole(
      app,
      'dispatcher@test.local',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  function bearer(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  it('rejects anonymous operational access', async () => {
    await request(app.getHttpServer()).get('/products').expect(401);
    await request(app.getHttpServer()).get('/stock').expect(401);
    await request(app.getHttpServer()).get('/payments').expect(401);
    await request(app.getHttpServer()).get('/finance/transactions').expect(401);
  });

  it('allows admin to access operational modules', async () => {
    await request(app.getHttpServer())
      .get('/products')
      .set(bearer(adminToken))
      .expect(200);

    await request(app.getHttpServer())
      .get('/stock')
      .set(bearer(adminToken))
      .expect(200);

    await request(app.getHttpServer())
      .get('/finance/transactions')
      .set(bearer(adminToken))
      .expect(200);
  });

  it('allows waiter to read products but blocks finance', async () => {
    await request(app.getHttpServer())
      .get('/products')
      .set(bearer(waiterToken))
      .expect(200);

    await request(app.getHttpServer())
      .get('/finance/transactions')
      .set(bearer(waiterToken))
      .expect(403);
  });

  it('allows cashier to settle payments but blocks supplier creation', async () => {
    await request(app.getHttpServer())
      .post('/payments/settle')
      .set(bearer(cashierToken))
      .send({})
      .expect((response) => {
        expect([400, 404, 422]).toContain(response.status);
      });

    await request(app.getHttpServer())
      .post('/suppliers')
      .set(bearer(cashierToken))
      .send({})
      .expect(403);
  });

  it('allows chef to access kitchen queue but blocks finance', async () => {
    await request(app.getHttpServer())
      .get('/kitchen/queue')
      .set(bearer(chefToken))
      .expect(200);

    await request(app.getHttpServer())
      .get('/finance/transactions')
      .set(bearer(chefToken))
      .expect(403);
  });

  it('allows barman to access bar queue but blocks stock adjustment approval', async () => {
    await request(app.getHttpServer())
      .get('/bar/queue')
      .set(bearer(barmanToken))
      .expect(200);

    await request(app.getHttpServer())
      .post('/stock/adjustment-requests/1/approve')
      .set(bearer(barmanToken))
      .expect(403);
  });

  it('allows storekeeper to operate stock but blocks finance reports', async () => {
    await request(app.getHttpServer())
      .get('/stock')
      .set(bearer(storekeeperToken))
      .expect(200);

    await request(app.getHttpServer())
      .get('/finance/income-statement')
      .set(bearer(storekeeperToken))
      .expect(403);
  });

  it('allows accountant to access finance but blocks kitchen actions', async () => {
    await request(app.getHttpServer())
      .get('/finance/transactions')
      .set(bearer(accountantToken))
      .expect(200);

    await request(app.getHttpServer())
      .post('/kitchen/orders/1/ready')
      .set(bearer(accountantToken))
      .expect(403);
  });

  it('allows dispatcher to access deliveries but blocks product mutation', async () => {
    await request(app.getHttpServer())
      .get('/deliveries')
      .set(bearer(dispatcherToken))
      .expect(200);

    await request(app.getHttpServer())
      .post('/products')
      .set(bearer(dispatcherToken))
      .send({})
      .expect(403);
  });

  it('allows manager oversight but blocks super-admin-only system operations', async () => {
    await request(app.getHttpServer())
      .get('/products')
      .set(bearer(managerToken))
      .expect(200);

    await request(app.getHttpServer())
      .get('/admin-dashboard/system-health')
      .set(bearer(managerToken))
      .expect(403);
  });
});
