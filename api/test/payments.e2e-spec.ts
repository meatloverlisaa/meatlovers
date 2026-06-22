import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Payments Settlement (e2e)', () => {
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
      prisma.$executeRawUnsafe('DELETE FROM payments'),
      prisma.$executeRawUnsafe('DELETE FROM order_items'),
      prisma.$executeRawUnsafe('DELETE FROM orders'),
      prisma.$executeRawUnsafe('DELETE FROM tables'),
      prisma.$executeRawUnsafe('DELETE FROM users'),
      prisma.$executeRawUnsafe('DELETE FROM products'),
    ]);
  });

  describe('Payment Creation', () => {
    it('should create a single payment for an order', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const createPaymentDto = {
        order_id: orderId,
        payments: [
          {
            payment_method: 'CASH',
            amount: 30.00,
            transaction_reference: 'CASH-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .send(createPaymentDto)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].payment_method).toBe('CASH');
      expect(response.body[0].amount).toBe('30.00');
      expect(response.body[0].payment_status).toBe('SUCCESS');
    });

    it('should create multi-pay payments for an order', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create multi-pay payment
      const createPaymentDto = {
        order_id: orderId,
        payments: [
          {
            payment_method: 'MPESA',
            amount: 20.00,
            transaction_reference: 'MPESA-001',
          },
          {
            payment_method: 'CASH',
            amount: 10.00,
            transaction_reference: 'CASH-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .send(createPaymentDto)
        .expect(201);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].payment_method).toBe('MPESA');
      expect(response.body[1].payment_method).toBe('CASH');
    });

    it('should reject payment with non-existent order', async () => {
      const createPaymentDto = {
        order_id: 999,
        payments: [
          {
            payment_method: 'CASH',
            amount: 30.00,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/payments')
        .send(createPaymentDto)
        .expect(404);
    });

    it('should reject payment with amount mismatch', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment with wrong amount
      const createPaymentDto = {
        order_id: orderId,
        payments: [
          {
            payment_method: 'CASH',
            amount: 25.00, // Should be 30.00
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/payments')
        .send(createPaymentDto)
        .expect(400);
    });

    it('should update order status to PAID after successful payment', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const createPaymentDto = {
        order_id: orderId,
        payments: [
          {
            payment_method: 'CASH',
            amount: 30.00,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/payments')
        .send(createPaymentDto)
        .expect(201);

      // Verify order status is PAID
      const orderCheck = await request(app.getHttpServer())
        .get(`/orders/${orderId}/status`);

      expect(orderCheck.body.status).toBe('PAID');
    });
  });

  describe('Payment Retrieval', () => {
    it('should find payment by ID', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      const paymentId = paymentResponse.body[0].id;

      // Find payment by ID
      const response = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .expect(200);

      expect(response.body.id).toBe(paymentId);
      expect(response.body.payment_method).toBe('CASH');
    });

    it('should find payments by order ID', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      // Find payments by order
      const response = await request(app.getHttpServer())
        .get(`/payments/order/${orderId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].order_id).toBe(orderId);
    });

    it('should return 404 for non-existent payment', async () => {
      await request(app.getHttpServer())
        .get('/payments/999')
        .expect(404);
    });
  });

  describe('Payment Status Update', () => {
    it('should update payment status', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      const paymentId = paymentResponse.body[0].id;

      // Update payment status
      const response = await request(app.getHttpServer())
        .patch(`/payments/${paymentId}/status`)
        .send({ status: 'FAILED' })
        .expect(200);

      expect(response.body.payment_status).toBe('FAILED');
    });
  });

  describe('Payment Refund', () => {
    it('should refund a payment', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      const paymentId = paymentResponse.body[0].id;

      // Refund payment
      const refundDto = {
        refund_amount: 30.00,
        reason: 'Customer complaint',
        refund_reference: 'REF-001',
      };

      const response = await request(app.getHttpServer())
        .post(`/payments/${paymentId}/refund`)
        .send(refundDto)
        .expect(200);

      expect(response.body.payment_status).toBe('REFUNDED');
    });

    it('should reject refund for non-SUCCESS payment', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      const paymentId = paymentResponse.body[0].id;

      // Update payment to FAILED
      await request(app.getHttpServer())
        .patch(`/payments/${paymentId}/status`)
        .send({ status: 'FAILED' });

      // Try to refund failed payment
      const refundDto = {
        refund_amount: 30.00,
        reason: 'Customer complaint',
      };

      await request(app.getHttpServer())
        .post(`/payments/${paymentId}/refund`)
        .send(refundDto)
        .expect(400);
    });

    it('should reject refund amount exceeding payment amount', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      const paymentId = paymentResponse.body[0].id;

      // Try to refund more than payment amount
      const refundDto = {
        refund_amount: 50.00,
        reason: 'Customer complaint',
      };

      await request(app.getHttpServer())
        .post(`/payments/${paymentId}/refund`)
        .send(refundDto)
        .expect(400);
    });
  });

  describe('Settlement Summary', () => {
    it('should get settlement summary', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payments
      await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [
            { payment_method: 'CASH', amount: 20.00 },
            { payment_method: 'MPESA', amount: 10.00 },
          ],
        })
        .expect(201);

      // Get settlement summary
      const response = await request(app.getHttpServer())
        .get('/payments/settlement/summary')
        .expect(200);

      expect(response.body.total_payments).toBe(2);
      expect(response.body.total_amount).toBe(30.00);
      expect(response.body.by_method.CASH).toBe(20.00);
      expect(response.body.by_method.MPESA).toBe(10.00);
    });

    it('should filter settlement summary by payment method', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payments
      await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [
            { payment_method: 'CASH', amount: 20.00 },
            { payment_method: 'MPESA', amount: 10.00 },
          ],
        })
        .expect(201);

      // Get settlement summary filtered by CASH
      const response = await request(app.getHttpServer())
        .get('/payments/settlement/summary')
        .query({ payment_method: 'CASH' })
        .expect(200);

      expect(response.body.total_payments).toBe(1);
      expect(response.body.total_amount).toBe(20.00);
    });
  });

  describe('Receipt Generation', () => {
    it('should generate receipt for payment', async () => {
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
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          tableId: 1,
          waiterId: 1,
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .send({
          order_id: orderId,
          payments: [{ payment_method: 'CASH', amount: 30.00 }],
        })
        .expect(201);

      const paymentId = paymentResponse.body[0].id;

      // Generate receipt
      const response = await request(app.getHttpServer())
        .get(`/payments/${paymentId}/receipt`)
        .expect(200);

      expect(response.body.receipt_number).toContain('RCP-');
      expect(response.body.payment_id).toBe(paymentId);
      expect(response.body.order_id).toBe(orderId);
      expect(response.body.payment_method).toBe('CASH');
      expect(response.body.amount_paid).toBe(30.00);
      expect(response.body.order_details).toBeDefined();
      expect(response.body.order_details.items).toHaveLength(1);
    });

    it('should return 404 for receipt of non-existent payment', async () => {
      await request(app.getHttpServer())
        .get('/payments/999/receipt')
        .expect(404);
    });
  });
});
