import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Orders Life-cycle (e2e)', () => {
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

  describe('Order Creation', () => {
    it('should create an order with valid data', async () => {
      // Setup: Create a table
      const table = await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );

      // Setup: Create a waiter user
      const waiter = await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );

      // Setup: Create products
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW()), (2, "Fries", "FOOD", 5.00, 2.00, 1, NOW(), NOW())'
      );

      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.table_id).toBe(1);
      expect(response.body.waiter_id).toBe(1);
      expect(response.body.total_amount).toBe(35.00); // 2*15 + 1*5
      expect(response.body.items).toHaveLength(2);
    });

    it('should reject order with non-existent table', async () => {
      // Setup: Create a waiter user
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );

      // Setup: Create products
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW())'
      );

      const createOrderDto = {
        tableId: 999, // Non-existent table
        waiterId: 1,
        items: [{ productId: 1, quantity: 1 }],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(404);
    });

    it('should reject order with non-waiter user', async () => {
      // Setup: Create a table
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );

      // Setup: Create a non-waiter user (CHEF)
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Chef", "john@test.com", "1234567890", "hashed_password", "CHEF", 1, NOW(), NOW())'
      );

      // Setup: Create products
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW())'
      );

      const createOrderDto = {
        tableId: 1,
        waiterId: 1, // This is a CHEF, not a WAITER
        items: [{ productId: 1, quantity: 1 }],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(400);
    });

    it('should reject order with inactive product', async () => {
      // Setup: Create a table
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );

      // Setup: Create a waiter user
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );

      // Setup: Create inactive product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 0, NOW(), NOW())'
      );

      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [{ productId: 1, quantity: 1 }],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(404);
    });
  });

  describe('Order Status Transitions', () => {
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

      // Create an order
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      orderId = response.body.id;
    });

    it('should transition from PENDING to PREPARING', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'PREPARING' })
        .expect(200);

      expect(response.body.status).toBe('PREPARING');
    });

    it('should transition from PREPARING to READY', async () => {
      // First transition to PREPARING
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'PREPARING' });

      // Then transition to READY
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(200);

      expect(response.body.status).toBe('READY');
    });

    it('should transition from READY to SERVED', async () => {
      // Transition through the full life-cycle
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'PREPARING' });
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'READY' });

      // Finally transition to SERVED
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'SERVED' })
        .expect(200);

      expect(response.body.status).toBe('SERVED');
    });

    it('should reject invalid status transition (PENDING to READY)', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(400);
    });

    it('should reject invalid status transition (PREPARING to SERVED)', async () => {
      // First transition to PREPARING
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'PREPARING' });

      // Try to skip READY and go to SERVED
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'SERVED' })
        .expect(400);
    });

    it('should allow no-op status update (same status)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'PENDING' })
        .expect(200);

      expect(response.body.status).toBe('PENDING');
    });
  });

  describe('Full Order Life-cycle Integration Test', () => {
    it('should complete full order life-cycle from creation to serving', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW()), (2, "Fries", "FOOD", 5.00, 2.00, 1, NOW(), NOW()), (3, "Soda", "SOFT_DRINK", 3.00, 1.00, 1, NOW(), NOW())'
      );

      // Step 1: Create order (PENDING)
      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
            { productId: 3, quantity: 2 },
          ],
        })
        .expect(201);

      const orderId = createResponse.body.id;
      expect(createResponse.body.status).toBe('PENDING');
      expect(createResponse.body.total_amount).toBe(43.00); // 2*15 + 1*5 + 2*3
      expect(createResponse.body.items).toHaveLength(3);

      // Step 2: Kitchen starts preparing (PREPARING)
      const preparingResponse = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'PREPARING' })
        .expect(200);

      expect(preparingResponse.body.status).toBe('PREPARING');

      // Step 3: Order is ready for serving (READY)
      const readyResponse = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(200);

      expect(readyResponse.body.status).toBe('READY');

      // Step 4: Order has been served (SERVED)
      const servedResponse = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .send({ status: 'SERVED' })
        .expect(200);

      expect(servedResponse.body.status).toBe('SERVED');

      // Verify final state
      const finalOrder = await request(app.getHttpServer())
        .get(`/orders/${orderId}/status`)
        .send({ status: 'SERVED' });

      // The order should be in SERVED state
      expect(servedResponse.body.status).toBe('SERVED');
      expect(servedResponse.body.items).toHaveLength(3);
    });
  });

  describe('Order Retrieval', () => {
    it('should find latest order by tableId', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW()), (2, "Table 2", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Burger", "FOOD", 15.00, 8.00, 1, NOW(), NOW())'
      );

      // Create first order for table 1
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      // Create second order for table 1 (should be the latest)
      const secondOrder = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      // Find latest order for table 1
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({ tableId: 1 })
        .expect(200);

      expect(response.body.id).toBe(secondOrder.body.id);
      expect(response.body.table_id).toBe(1);
    });

    it('should find latest order by waiterId', async () => {
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

      // Create first order
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 1 }],
        });

      // Create second order (should be the latest)
      const secondOrder = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      // Find latest order by waiter
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({ waiterId: 1 })
        .expect(200);

      expect(response.body.id).toBe(secondOrder.body.id);
      expect(response.body.waiter_id).toBe(1);
    });

    it('should reject order retrieval without tableId or waiterId', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .expect(400);
    });
  });

  describe('Order Validation', () => {
    it('should reject order with empty items array', async () => {
      // Setup: Create test data
      await prisma.$executeRawUnsafe(
        'INSERT INTO tables (id, table_name, created_at, updated_at) VALUES (1, "Table 1", NOW(), NOW())'
      );
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "John Waiter", "john@test.com", "1234567890", "hashed_password", "WAITER", 1, NOW(), NOW())'
      );

      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(400);
    });

    it('should reject order with zero or negative quantity', async () => {
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

      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [{ productId: 1, quantity: 0 }],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(400);
    });

    it('should reject order with missing required fields', async () => {
      const createOrderDto = {
        tableId: 1,
        // Missing waiterId
        items: [{ productId: 1, quantity: 1 }],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(400);
    });
  });
});
