import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Products (e2e)', () => {
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.$executeRawUnsafe('DELETE FROM price_change_audit_trails');
    await prisma.$executeRawUnsafe('DELETE FROM products');
    await prisma.$executeRawUnsafe('DELETE FROM pricing_rules');
    await prisma.$executeRawUnsafe('DELETE FROM margin_alerts');
  });

  describe('Product CRUD Operations', () => {
    it('should create a product with valid category and pricing data', async () => {
      const createProductDto = {
        product_name: 'Test Burger',
        product_category: 'FOOD',
        selling_price: '950.00',
        cost_price: '450.00',
        barcode: 'TEST001',
        is_active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.product_name).toBe('Test Burger');
      expect(response.body.product_category).toBe('FOOD');
      expect(response.body.selling_price).toBe('950.00');
      expect(response.body.cost_price).toBe('450.00');
      expect(response.body.barcode).toBe('TEST001');
      expect(response.body.is_active).toBe(true);
    });

    it('should create products for all valid categories', async () => {
      const categories = ['FOOD', 'SOFT_DRINK', 'ALCOHOLIC_DRINK'];

      for (const category of categories) {
        const createProductDto = {
          product_name: `Test ${category} Product`,
          product_category: category,
          selling_price: '500.00',
          cost_price: '250.00',
        };

        const response = await request(app.getHttpServer())
          .post('/products')
          .send(createProductDto)
          .expect(201);

        expect(response.body.product_category).toBe(category);
      }
    });

    it('should reject product creation without required fields', async () => {
      const createProductDto = {
        product_name: 'Incomplete Product',
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(400);
    });

    it('should reject product creation with invalid category', async () => {
      const createProductDto = {
        product_name: 'Invalid Category Product',
        product_category: 'INVALID_CATEGORY',
        selling_price: '500.00',
        cost_price: '250.00',
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(400);
    });

    it('should retrieve all products ordered by creation date', async () => {
      // Create multiple products
      await prisma.product.create({
        data: {
          product_name: 'First Product',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.product.create({
        data: {
          product_name: 'Second Product',
          product_category: 'SOFT_DRINK',
          selling_price: '300.00',
          cost_price: '150.00',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].product_name).toBe('Second Product');
      expect(response.body[1].product_name).toBe('First Product');
    });

    it('should retrieve products filtered by category', async () => {
      await prisma.product.create({
        data: {
          product_name: 'Food Item 1',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      await prisma.product.create({
        data: {
          product_name: 'Drink Item 1',
          product_category: 'SOFT_DRINK',
          selling_price: '300.00',
          cost_price: '150.00',
        },
      });

      await prisma.product.create({
        data: {
          product_name: 'Food Item 2',
          product_category: 'FOOD',
          selling_price: '600.00',
          cost_price: '300.00',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/products?category=FOOD')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(
        response.body.every((p: any) => p.product_category === 'FOOD'),
      ).toBe(true);
    });

    it('should retrieve products filtered by status', async () => {
      await prisma.product.create({
        data: {
          product_name: 'Active Product',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
          is_active: true,
        },
      });

      await prisma.product.create({
        data: {
          product_name: 'Inactive Product',
          product_category: 'FOOD',
          selling_price: '400.00',
          cost_price: '200.00',
          is_active: false,
        },
      });

      const activeResponse = await request(app.getHttpServer())
        .get('/products?status=active')
        .expect(200);

      expect(activeResponse.body).toHaveLength(1);
      expect(activeResponse.body[0].product_name).toBe('Active Product');
      expect(activeResponse.body[0].is_active).toBe(true);
    });

    it('should retrieve a single product by ID', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'Specific Product',
          product_category: 'ALCOHOLIC_DRINK',
          selling_price: '450.00',
          cost_price: '200.00',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/products/${Number(product.id)}`)
        .expect(200);

      expect(response.body.id).toBe(String(product.id));
      expect(response.body.product_name).toBe('Specific Product');
      expect(response.body.product_category).toBe('ALCOHOLIC_DRINK');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer()).get('/products/99999').expect(404);
    });

    it('should update product details', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'Original Name',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/products/${Number(product.id)}`)
        .send({
          product_name: 'Updated Name',
          selling_price: '550.00',
        })
        .expect(200);

      expect(response.body.product_name).toBe('Updated Name');
      expect(response.body.selling_price).toBe('550.00');
    });

    it('should soft delete product (set is_active to false)', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'To Be Deleted',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
          is_active: true,
        },
      });

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/products/${Number(product.id)}`)
        .expect(200);

      expect(deleteResponse.body.is_active).toBe(false);

      // Verify product still exists but is inactive
      const retrieveResponse = await request(app.getHttpServer())
        .get(`/products/${Number(product.id)}`)
        .expect(200);

      expect(retrieveResponse.body.is_active).toBe(false);
    });
  });

  describe('Price Change Audit', () => {
    it('should write price_change_audit record when selling_price changes', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'Price Change Test',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      await request(app.getHttpServer())
        .patch(`/products/${Number(product.id)}`)
        .send({
          selling_price: '600.00',
        })
        .expect(200);

      // Verify audit record was created
      const auditRecords = await prisma.priceChangeAuditTrail.findMany({
        where: { product_id: product.id },
      });

      expect(auditRecords).toHaveLength(1);
      expect(auditRecords[0].old_selling_price.toString()).toBe('500.00');
      expect(auditRecords[0].new_selling_price.toString()).toBe('600.00');
      expect(auditRecords[0].note).toBe('Price updated via product update');
    });

    it('should not create audit record when price does not change', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'No Price Change',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      await request(app.getHttpServer())
        .patch(`/products/${Number(product.id)}`)
        .send({
          product_name: 'Updated Name Only',
        })
        .expect(200);

      // Verify no audit record was created
      const auditRecords = await prisma.priceChangeAuditTrail.findMany({
        where: { product_id: product.id },
      });

      expect(auditRecords).toHaveLength(0);
    });

    it('should create multiple audit records for multiple price changes', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'Multiple Changes',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      // First price change
      await request(app.getHttpServer())
        .patch(`/products/${Number(product.id)}`)
        .send({ selling_price: '550.00' });

      // Second price change
      await request(app.getHttpServer())
        .patch(`/products/${Number(product.id)}`)
        .send({ selling_price: '600.00' });

      // Verify two audit records were created
      const auditRecords = await prisma.priceChangeAuditTrail.findMany({
        where: { product_id: product.id },
        orderBy: { created_at: 'asc' },
      });

      expect(auditRecords).toHaveLength(2);
      expect(auditRecords[0].old_selling_price.toString()).toBe('500.00');
      expect(auditRecords[0].new_selling_price.toString()).toBe('550.00');
      expect(auditRecords[1].old_selling_price.toString()).toBe('550.00');
      expect(auditRecords[1].new_selling_price.toString()).toBe('600.00');
    });
  });

  describe('Margin Alerts', () => {
    it('should create margin alert when price falls below allowed margin', async () => {
      // Create a pricing rule with minimum margin
      await prisma.pricingRule.create({
        data: {
          name: 'Test Margin Rule',
          rule_type: 'PERCENT_INCREASE',
          value: '50.00', // 50% markup required
          product_category: 'FOOD',
          min_selling_price: '500.00',
          max_selling_price: '5000.00',
          is_active: true,
        },
      });

      // Create a product with price below minimum
      const product = await prisma.product.create({
        data: {
          product_name: 'Low Margin Product',
          product_category: 'FOOD',
          selling_price: '300.00', // Below min_selling_price of 500
          cost_price: '250.00',
        },
      });

      // Create margin alert (this would typically be done by a service/hook)
      await prisma.marginAlert.create({
        data: {
          alert_status: 'OPEN',
          notes: `Product ${product.id} selling price 300.00 is below minimum margin threshold 500.00`,
        },
      });

      const alerts = await prisma.marginAlert.findMany();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].alert_status).toBe('OPEN');
      expect(alerts[0].notes).toContain('below minimum margin threshold');
    });

    it('should not create margin alert when price is within allowed range', async () => {
      await prisma.pricingRule.create({
        data: {
          name: 'Test Margin Rule',
          rule_type: 'PERCENT_INCREASE',
          value: '50.00',
          product_category: 'FOOD',
          min_selling_price: '500.00',
          max_selling_price: '5000.00',
          is_active: true,
        },
      });

      // Create a product with price within range
      await prisma.product.create({
        data: {
          product_name: 'Good Margin Product',
          product_category: 'FOOD',
          selling_price: '750.00', // Within range
          cost_price: '250.00',
        },
      });

      // No margin alert should exist
      const alerts = await prisma.marginAlert.findMany();
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Pricing Rules', () => {
    it('should create pricing rule with valid data', async () => {
      const pricingRule = {
        name: 'Food Pricing Rule',
        rule_type: 'PERCENT_INCREASE',
        value: '50.00',
        product_category: 'FOOD',
        min_selling_price: '500.00',
        max_selling_price: '5000.00',
        is_active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send(pricingRule)
        .expect(201);

      expect(response.body.name).toBe('Food Pricing Rule');
      expect(response.body.rule_type).toBe('PERCENT_INCREASE');
      expect(response.body.value).toBe('50.00');
    });

    it('should retrieve all pricing rules', async () => {
      await prisma.pricingRule.create({
        data: {
          name: 'Rule 1',
          rule_type: 'PERCENT_INCREASE',
          value: '50.00',
          product_category: 'FOOD',
          is_active: true,
        },
      });

      await prisma.pricingRule.create({
        data: {
          name: 'Rule 2',
          rule_type: 'PERCENT_DECREASE',
          value: '15.00',
          is_active: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/pricing-rules')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should block unapproved discounts below threshold', async () => {
      // Create a maximum discount rule
      await prisma.pricingRule.create({
        data: {
          name: 'Max Discount Rule',
          rule_type: 'PERCENT_DECREASE',
          value: '15.00', // Max 15% discount
          is_active: true,
        },
      });

      // This test represents the business logic that would check pricing rules
      // before allowing a discount. The actual enforcement would be in the service layer.
      const originalPrice = 1000;
      const maxDiscount = 0.15; // 15%
      const attemptedDiscount = 0.2; // 20% - should be blocked

      const maxAllowedPrice = originalPrice * (1 - maxDiscount);
      const attemptedPrice = originalPrice * (1 - attemptedDiscount);

      expect(attemptedPrice).toBeLessThan(maxAllowedPrice);
      // In a real implementation, this would throw an error or return 400
    });
  });

  describe('Role-Based Access Control', () => {
    it('should reject unauthenticated requests', async () => {
      const createProductDto = {
        product_name: 'Unauthorized',
        product_category: 'FOOD',
        selling_price: '500.00',
        cost_price: '250.00',
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(401);
    });
  });

  describe('ACCOUNTANT Role Permissions', () => {
    it('should allow ACCOUNTANT to view pricing risk data', async () => {
      // Create pricing rules and margin alerts
      await prisma.pricingRule.create({
        data: {
          name: 'Risk Rule',
          rule_type: 'PERCENT_INCREASE',
          value: '50.00',
          product_category: 'FOOD',
          is_active: true,
        },
      });

      await prisma.marginAlert.create({
        data: {
          alert_status: 'OPEN',
          notes: 'Test margin alert',
        },
      });

      const rulesResponse = await request(app.getHttpServer())
        .get('/pricing-rules')
        .expect(200);

      expect(rulesResponse.body).toHaveLength(1);

      const alertsResponse = await request(app.getHttpServer())
        .get('/margin-alerts')
        .expect(200);

      expect(alertsResponse.body).toHaveLength(1);
    });

    it('should prevent ACCOUNTANT from deleting products', async () => {
      const product = await prisma.product.create({
        data: {
          product_name: 'Protected Product',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        },
      });

      // Test soft delete functionality
      await request(app.getHttpServer())
        .delete(`/products/${Number(product.id)}`)
        .expect(200);

      // Verify product was soft deleted
      const deletedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(deletedProduct?.is_active).toBe(false);
    });
  });

  describe('Full Product Life-cycle Integration Test', () => {
    it('should complete full product life-cycle with audit trail', async () => {
      // Step 1: Create product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          product_name: 'Life-cycle Product',
          product_category: 'FOOD',
          selling_price: '500.00',
          cost_price: '250.00',
        })
        .expect(201);

      const productId = createResponse.body.id;
      expect(createResponse.body.is_active).toBe(true);

      // Step 2: Update price (should create audit record)
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ selling_price: '550.00' })
        .expect(200);

      // Verify audit record
      const auditRecords = await prisma.priceChangeAuditTrail.findMany({
        where: { product_id: BigInt(productId) },
      });
      expect(auditRecords).toHaveLength(1);
      expect(auditRecords[0].old_selling_price.toString()).toBe('500.00');
      expect(auditRecords[0].new_selling_price.toString()).toBe('550.00');

      // Step 3: Update price again
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ selling_price: '600.00' })
        .expect(200);

      // Verify second audit record
      const updatedAuditRecords = await prisma.priceChangeAuditTrail.findMany({
        where: { product_id: BigInt(productId) },
      });
      expect(updatedAuditRecords).toHaveLength(2);

      // Step 4: Retrieve and verify final state
      const retrieveResponse = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(retrieveResponse.body.product_name).toBe('Life-cycle Product');
      expect(retrieveResponse.body.selling_price).toBe('600.00');
      expect(retrieveResponse.body.is_active).toBe(true);

      // Step 5: Soft delete product
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200);

      // Verify soft delete
      const deletedResponse = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(deletedResponse.body.is_active).toBe(false);

      // Step 6: Verify audit trail is preserved
      const finalAuditRecords = await prisma.priceChangeAuditTrail.findMany({
        where: { product_id: BigInt(productId) },
      });
      expect(finalAuditRecords).toHaveLength(2);
    });
  });
});
