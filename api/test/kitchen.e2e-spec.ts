import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Kitchen Operations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    // BigInt serialization fix
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.$transaction([
      prisma.$executeRawUnsafe('DELETE FROM order_items'),
      prisma.$executeRawUnsafe('DELETE FROM orders'),
      prisma.$executeRawUnsafe('DELETE FROM tables'),
      prisma.$executeRawUnsafe('DELETE FROM users'),
      prisma.$executeRawUnsafe('DELETE FROM products'),
    ]);
  });

  describe('Kitchen Queue Management', () => {
    it('should get kitchen queue with food orders only', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW()), (2, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW())'
      );

      // Create a food order
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        });

      // Create a drink order (should not appear in kitchen queue)
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 1 }],
        });

      const response = await request(app.getHttpServer())
        .get('/kitchen/queue')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].items[0].product_name).toBe('Burger');
    });

    it('should get kitchen queue filtered by status', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW()), (2, "Fries", "FOOD", 5.00, 2.00, 1, NOW(), NOW())'
      );

      // Create first food order
      const order1 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      // Create second food order
      const order2 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 1 }],
        });

      // Update first order to PREPARING
      await request(app.getHttpServer())
        .patch(`/orders/${order1.body.id}/status`)
        .send({ status: 'PREPARING' });

      // Get PENDING orders only
      const pendingResponse = await request(app.getHttpServer())
        .get('/kitchen/queue?status=PENDING')
        .expect(200);

      expect(pendingResponse.body).toHaveLength(1);
      expect(pendingResponse.body[0].id).toBe(order2.body.id);

      // Get PREPARING orders only
      const preparingResponse = await request(app.getHttpServer())
        .get('/kitchen/queue?status=PREPARING')
        .expect(200);

      expect(preparingResponse.body).toHaveLength(1);
      expect(preparingResponse.body[0].id).toBe(order1.body.id);
    });

    it('should get kitchen summary', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW()), (2, "Fries", "FOOD", 5.00, 2.00, 1, NOW(), NOW()), (3, "Pizza", "FOOD", 20.00, 10.00, 1, NOW(), NOW())'
      );

      // Create three food orders
      const order1 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      const order2 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 1 }],
        });

      const order3 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 3, quantity: 1 }],
        });

      // Update statuses
      await request(app.getHttpServer())
        .patch(`/orders/${order2.body.id}/status`)
        .send({ status: 'PREPARING' });

      await request(app.getHttpServer())
        .patch(`/orders/${order3.body.id}/status`)
        .send({ status: 'READY' });

      const response = await request(app.getHttpServer())
        .get('/kitchen/summary')
        .expect(200);

      expect(response.body.pending).toBe(1);
      expect(response.body.preparing).toBe(1);
      expect(response.body.ready).toBe(1);
      expect(response.body.total).toBe(3);
    });
  });

  describe('Kitchen Order Status Updates', () => {
    let orderId: number;

    beforeEach(async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW())'
      );

      // Create a food order
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      orderId = response.body.id;
    });

    it('should update food order status from PENDING to PREPARING', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'PREPARING' })
        .expect(200);

      expect(response.body.status).toBe('PREPARING');
    });

    it('should update food order status from PREPARING to READY', async () => {
      // First transition to PREPARING
      await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'PREPARING' });

      // Then transition to READY
      const response = await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(200);

      expect(response.body.status).toBe('READY');
    });

    it('should update food order status from READY to SERVED', async () => {
      // Transition through the life-cycle
      await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'PREPARING' });

      await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'READY' });

      // Finally transition to SERVED
      const response = await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'SERVED' })
        .expect(200);

      expect(response.body.status).toBe('SERVED');
    });

    it('should reject status update for non-food order', async () => {
      // Create a drink order
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (2, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW())'
      );

      const drinkOrder = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 1 }],
        });

      // Try to update drink order through kitchen endpoint
      await request(app.getHttpServer())
        .patch(`/kitchen/queue/${drinkOrder.body.id}/status`)
        .send({ status: 'PREPARING' })
        .expect(404);
    });

    it('should reject invalid status transition', async () => {
      // Try to skip from PENDING to READY
      await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(400);
    });
  });

  describe('Real-time Status Sync Integration', () => {
    it('should reflect status changes across POS and Kitchen endpoints', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW())'
      );

      // Create order via POS (orders endpoint)
      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        })
        .expect(201);

      const orderId = createResponse.body.id;

      // Update status via Kitchen endpoint
      await request(app.getHttpServer())
        .patch(`/kitchen/queue/${orderId}/status`)
        .send({ status: 'PREPARING' })
        .expect(200);

      // Verify status is updated when queried via POS endpoint
      const posResponse = await request(app.getHttpServer())
        .get(`/orders/all`)
        .expect(200);

      const updatedOrder = posResponse.body.find((o: any) => o.id === orderId);
      expect(updatedOrder.status).toBe('PREPARING');

      // Update status via POS endpoint
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(200);

      // Verify status is updated when queried via Kitchen endpoint
      const kitchenResponse = await request(app.getHttpServer())
        .get('/kitchen/queue')
        .expect(200);

      const kitchenOrder = kitchenResponse.body.find((o: any) => o.id === orderId);
      expect(kitchenOrder.status).toBe('READY');
    });
  });
});
