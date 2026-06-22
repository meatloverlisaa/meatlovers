import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Bar Operations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('Bar Order Management', () => {
    it('should get bar orders with drink orders only', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW()), (2, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW()), (3, "Beer", "ALCOHOLIC_DRINK", 5.00, 2.00, 1, NOW(), NOW())'
      );

      // Create a drink order (soft drink)
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 2 }],
        });

      // Create a drink order (alcohol)
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 3, quantity: 1 }],
        });

      // Create a food order (should not appear in bar queue)
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      const response = await request(app.getHttpServer())
        .get('/bar/orders')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.some((o: any) => o.items[0].product_name === 'Soda')).toBe(true);
      expect(response.body.some((o: any) => o.items[0].product_name === 'Beer')).toBe(true);
    });

    it('should get bar orders filtered by status', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW()), (2, "Beer", "ALCOHOLIC_DRINK", 5.00, 2.00, 1, NOW(), NOW())'
      );

      // Create first drink order
      const order1 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      // Create second drink order
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
        .get('/bar/orders?status=PENDING')
        .expect(200);

      expect(pendingResponse.body).toHaveLength(1);
      expect(pendingResponse.body[0].id).toBe(order2.body.id);

      // Get PREPARING orders only
      const preparingResponse = await request(app.getHttpServer())
        .get('/bar/orders?status=PREPARING')
        .expect(200);

      expect(preparingResponse.body).toHaveLength(1);
      expect(preparingResponse.body[0].id).toBe(order1.body.id);
    });

    it('should get bar summary', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW()), (2, "Beer", "ALCOHOLIC_DRINK", 5.00, 2.00, 1, NOW(), NOW()), (3, "Wine", "ALCOHOLIC_DRINK", 10.00, 5.00, 1, NOW(), NOW())'
      );

      // Create three drink orders
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
        .get('/bar/summary')
        .expect(200);

      expect(response.body.pending).toBe(1);
      expect(response.body.preparing).toBe(1);
      expect(response.body.ready).toBe(1);
      expect(response.body.total).toBe(3);
    });
  });

  describe('Bar Order Status Updates', () => {
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
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW())'
      );

      // Create a drink order
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      orderId = response.body.id;
    });

    it('should update drink order status from PENDING to PREPARING', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'PREPARING' })
        .expect(200);

      expect(response.body.status).toBe('PREPARING');
    });

    it('should update drink order status from PREPARING to READY', async () => {
      // First transition to PREPARING
      await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'PREPARING' });

      // Then transition to READY
      const response = await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(200);

      expect(response.body.status).toBe('READY');
    });

    it('should update drink order status from READY to SERVED', async () => {
      // Transition through the life-cycle
      await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'PREPARING' });

      await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'READY' });

      // Finally transition to SERVED
      const response = await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'SERVED' })
        .expect(200);

      expect(response.body.status).toBe('SERVED');
    });

    it('should reject status update for non-drink order', async () => {
      // Create a food order
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (2, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW())'
      );

      const foodOrder = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 1 }],
        });

      // Try to update food order through bar endpoint
      await request(app.getHttpServer())
        .patch(`/bar/orders/${foodOrder.body.id}/status`)
        .send({ status: 'PREPARING' })
        .expect(404);
    });

    it('should reject invalid status transition', async () => {
      // Try to skip from PENDING to READY
      await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(400);
    });
  });

  describe('Bar Sales Tracking', () => {
    it('should get bar sales data', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW()), (2, "Beer", "ALCOHOLIC_DRINK", 5.00, 2.00, 1, NOW(), NOW())'
      );

      // Create drink orders and mark as served
      const order1 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        });

      const order2 = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 2, quantity: 1 }],
        });

      // Mark orders as served
      await request(app.getHttpServer())
        .patch(`/orders/${order1.body.id}/status`)
        .send({ status: 'PREPARING' });

      await request(app.getHttpServer())
        .patch(`/orders/${order1.body.id}/status`)
        .send({ status: 'READY' });

      await request(app.getHttpServer())
        .patch(`/orders/${order1.body.id}/status`)
        .send({ status: 'SERVED' });

      await request(app.getHttpServer())
        .patch(`/orders/${order2.body.id}/status`)
        .send({ status: 'PREPARING' });

      await request(app.getHttpServer())
        .patch(`/orders/${order2.body.id}/status`)
        .send({ status: 'READY' });

      await request(app.getHttpServer())
        .patch(`/orders/${order2.body.id}/status`)
        .send({ status: 'SERVED' });

      const response = await request(app.getHttpServer())
        .get('/bar/sales')
        .expect(200);

      expect(response.body.totalOrders).toBe(2);
      expect(response.body.totalAmount).toBe(11.00); // 2*3 + 1*5
      expect(response.body.softDrinkSales).toBe(6.00);
      expect(response.body.alcoholSales).toBe(5.00);
      expect(response.body.orders).toHaveLength(2);
    });

    it('should get bar sales filtered by date range', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW())'
      );

      // Create drink order
      const order = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      // Mark as served
      await request(app.getHttpServer())
        .patch(`/orders/${order.body.id}/status`)
        .send({ status: 'PREPARING' });

      await request(app.getHttpServer())
        .patch(`/orders/${order.body.id}/status`)
        .send({ status: 'READY' });

      await request(app.getHttpServer())
        .patch(`/orders/${order.body.id}/status`)
        .send({ status: 'SERVED' });

      // Get sales for today
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app.getHttpServer())
        .get(`/bar/sales?startDate=${today}&endDate=${today}`)
        .expect(200);

      expect(response.body.totalOrders).toBe(1);
    });
  });

  describe('Real-time Status Sync Integration', () => {
    it('should reflect status changes across POS and Bar endpoints', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW())'
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

      // Update status via Bar endpoint
      await request(app.getHttpServer())
        .patch(`/bar/orders/${orderId}/status`)
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

      // Verify status is updated when queried via Bar endpoint
      const barResponse = await request(app.getHttpServer())
        .get('/bar/orders')
        .expect(200);

      const barOrder = barResponse.body.find((o: any) => o.id === orderId);
      expect(barOrder.status).toBe('READY');
    });
  });
});
