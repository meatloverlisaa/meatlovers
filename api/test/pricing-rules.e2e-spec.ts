import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Pricing Rules and Audit Logging (e2e)', () => {
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
      prisma.$executeRawUnsafe('DELETE FROM price_change_audit_trails'),
      prisma.$executeRawUnsafe('DELETE FROM pricing_rules'),
      prisma.$executeRawUnsafe('DELETE FROM products'),
      prisma.$executeRawUnsafe('DELETE FROM users'),
    ]);
  });

  describe('Pricing Rule CRUD Operations', () => {
    it('should create a pricing rule with valid data', async () => {
      const createRuleDto = {
        name: 'Happy Hour Discount',
        rule_type: 'PERCENT_DECREASE',
        value: '20.00',
        product_category: 'ALCOHOLIC_DRINK',
        min_selling_price: '5.00',
        max_selling_price: '50.00',
        is_active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send(createRuleDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Happy Hour Discount');
      expect(response.body.rule_type).toBe('PERCENT_DECREASE');
      expect(response.body.value).toBe('20.00');
      expect(response.body.product_category).toBe('ALCOHOLIC_DRINK');
    });

    it('should create a FIXED_PRICE pricing rule', async () => {
      const createRuleDto = {
        name: 'Fixed Price Special',
        rule_type: 'FIXED_PRICE',
        value: '10.00',
        is_active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send(createRuleDto)
        .expect(201);

      expect(response.body.rule_type).toBe('FIXED_PRICE');
      expect(response.body.value).toBe('10.00');
    });

    it('should retrieve all pricing rules', async () => {
      // Create multiple rules
      await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Rule 1',
          rule_type: 'PERCENT_INCREASE',
          value: '10.00',
        });

      await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Rule 2',
          rule_type: 'PERCENT_DECREASE',
          value: '15.00',
        });

      const response = await request(app.getHttpServer())
        .get('/pricing-rules')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Rule 2'); // Should be ordered by created_at desc
    });

    it('should retrieve a single pricing rule by ID', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Test Rule',
          rule_type: 'PERCENT_INCREASE',
          value: '10.00',
        });

      const ruleId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/pricing-rules/${ruleId}`)
        .expect(200);

      expect(response.body.id).toBe(ruleId);
      expect(response.body.name).toBe('Test Rule');
    });

    it('should return 404 for non-existent pricing rule', async () => {
      await request(app.getHttpServer())
        .get('/pricing-rules/99999')
        .expect(404);
    });

    it('should update a pricing rule', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Original Name',
          rule_type: 'PERCENT_INCREASE',
          value: '10.00',
        });

      const ruleId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/pricing-rules/${ruleId}`)
        .send({
          name: 'Updated Name',
          value: '15.00',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.value).toBe('15.00');
    });

    it('should delete a pricing rule', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'To Delete',
          rule_type: 'PERCENT_INCREASE',
          value: '10.00',
        });

      const ruleId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/pricing-rules/${ruleId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/pricing-rules/${ruleId}`)
        .expect(404);
    });
  });

  describe('Pricing Rule Enforcement', () => {
    let userId: number;
    let productId: number;

    beforeEach(async () => {
      // Create a user for audit logging
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "Admin User", "admin@test.com", "1234567890", "hashed_password", "ADMIN", 1, NOW(), NOW())'
      );
      userId = 1;

      // Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Test Product", "FOOD", 20.00, 10.00, 1, NOW(), NOW())'
      );
      productId = 1;
    });

    it('should apply FIXED_PRICE rule correctly', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Fixed Price Rule',
          rule_type: 'FIXED_PRICE',
          value: '15.00',
        });

      const ruleId = ruleResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'Applying fixed price',
        })
        .expect(201);

      expect(response.body.product.selling_price).toBe('15.00');
      expect(response.body.audit).toHaveProperty('id');
      expect(response.body.audit.old_selling_price).toBe('20.00');
      expect(response.body.audit.new_selling_price).toBe('15.00');
    });

    it('should apply PERCENT_INCREASE rule correctly', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Price Increase',
          rule_type: 'PERCENT_INCREASE',
          value: '25.00',
        });

      const ruleId = ruleResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // 20.00 * 1.25 = 25.00
      expect(response.body.product.selling_price).toBe('25.00');
      expect(response.body.audit.old_selling_price).toBe('20.00');
      expect(response.body.audit.new_selling_price).toBe('25.00');
    });

    it('should apply PERCENT_DECREASE rule correctly', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Price Decrease',
          rule_type: 'PERCENT_DECREASE',
          value: '20.00',
        });

      const ruleId = ruleResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // 20.00 * 0.80 = 16.00
      expect(response.body.product.selling_price).toBe('16.00');
      expect(response.body.audit.old_selling_price).toBe('20.00');
      expect(response.body.audit.new_selling_price).toBe('16.00');
    });

    it('should enforce min_selling_price constraint', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Decrease with Min',
          rule_type: 'PERCENT_DECREASE',
          value: '50.00',
          min_selling_price: '12.00',
        });

      const ruleId = ruleResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // 20.00 * 0.50 = 10.00, but min is 12.00, so should be 12.00
      expect(response.body.product.selling_price).toBe('12.00');
    });

    it('should enforce max_selling_price constraint', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Increase with Max',
          rule_type: 'PERCENT_INCREASE',
          value: '100.00',
          max_selling_price: '25.00',
        });

      const ruleId = ruleResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // 20.00 * 2.00 = 40.00, but max is 25.00, so should be 25.00
      expect(response.body.product.selling_price).toBe('25.00');
    });

    it('should enforce both min and max constraints', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Constrained Rule',
          rule_type: 'FIXED_PRICE',
          value: '5.00',
          min_selling_price: '10.00',
          max_selling_price: '30.00',
        });

      const ruleId = ruleResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // Fixed price is 5.00, but min is 10.00, so should be 10.00
      expect(response.body.product.selling_price).toBe('10.00');
    });

    it('should reject rule application for non-existent product', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Test Rule',
          rule_type: 'FIXED_PRICE',
          value: '15.00',
        });

      const ruleId = ruleResponse.body.id;

      await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: 99999,
          actorUserId: userId,
        })
        .expect(404);
    });

    it('should reject rule application for non-existent rule', async () => {
      await request(app.getHttpServer())
        .post('/pricing-rules/99999/apply')
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(404);
    });

    it('should enforce category-based pricing rule validation', async () => {
      // Create a rule for ALCOHOLIC_DRINK category
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Alcohol Discount',
          rule_type: 'PERCENT_DECREASE',
          value: '10.00',
          product_category: 'ALCOHOLIC_DRINK',
        });

      const ruleId = ruleResponse.body.id;

      // Try to apply to a FOOD product (should fail)
      await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId, // This is a FOOD product
          actorUserId: userId,
        })
        .expect(404);
    });

    it('should allow category-matching rule application', async () => {
      // Create an ALCOHOLIC_DRINK product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (2, "Beer", "ALCOHOLIC_DRINK", 10.00, 5.00, 1, NOW(), NOW())'
      );

      // Create a rule for ALCOHOLIC_DRINK category
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Alcohol Discount',
          rule_type: 'PERCENT_DECREASE',
          value: '10.00',
          product_category: 'ALCOHOLIC_DRINK',
        });

      const ruleId = ruleResponse.body.id;

      // Apply to matching category product (should succeed)
      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: 2,
          actorUserId: userId,
        })
        .expect(201);

      // 10.00 * 0.90 = 9.00
      expect(response.body.product.selling_price).toBe('9.00');
    });

    it('should allow rule without category restriction', async () => {
      // Create a rule without category restriction
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Universal Discount',
          rule_type: 'PERCENT_DECREASE',
          value: '10.00',
        });

      const ruleId = ruleResponse.body.id;

      // Apply to any product (should succeed)
      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      expect(response.body.product.selling_price).toBe('18.00');
    });
  });

  describe('Audit Logging', () => {
    let userId: number;
    let productId: number;
    let ruleId: number;

    beforeEach(async () => {
      // Create a user
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "Admin User", "admin@test.com", "1234567890", "hashed_password", "ADMIN", 1, NOW(), NOW())'
      );
      userId = 1;

      // Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Test Product", "FOOD", 20.00, 10.00, 1, NOW(), NOW())'
      );
      productId = 1;

      // Create a pricing rule
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Test Rule',
          rule_type: 'PERCENT_INCREASE',
          value: '10.00',
        });
      ruleId = ruleResponse.body.id;
    });

    it('should create audit trail entry when pricing rule is applied', async () => {
      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'Price adjustment',
        })
        .expect(201);

      expect(response.body.audit).toHaveProperty('id');
      expect(response.body.audit.product_id).toBe(productId);
      expect(response.body.audit.pricing_rule_id).toBe(ruleId);
      expect(response.body.audit.actor_user_id).toBe(userId);
      expect(response.body.audit.old_selling_price).toBe('20.00');
      expect(response.body.audit.new_selling_price).toBe('22.00');
      expect(response.body.audit.note).toBe('Price adjustment');
      expect(response.body.audit).toHaveProperty('created_at');
    });

    it('should create audit trail without note', async () => {
      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      expect(response.body.audit.note).toBeNull();
    });

    it('should store audit entry in database', async () => {
      await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'Test audit',
        });

      // Query database directly
      const audits = await prisma.$queryRaw<Array<any>>`
        SELECT * FROM price_change_audit_trails WHERE product_id = ${productId}
      `;

      expect(audits).toHaveLength(1);
      expect(audits[0].product_id).toBe(BigInt(productId));
      expect(audits[0].pricing_rule_id).toBe(BigInt(ruleId));
      expect(audits[0].actor_user_id).toBe(BigInt(userId));
    });

    it('should create multiple audit entries for sequential price changes', async () => {
      // First price change
      await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'First change',
        });

      // Create another rule for decrease
      const decreaseRuleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Decrease Rule',
          rule_type: 'PERCENT_DECREASE',
          value: '10.00',
        });

      // Second price change
      await request(app.getHttpServer())
        .post(`/pricing-rules/${decreaseRuleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'Second change',
        });

      // Query database
      const audits = await prisma.$queryRaw<Array<any>>`
        SELECT * FROM price_change_audit_trails WHERE product_id = ${productId} ORDER BY created_at ASC
      `;

      expect(audits).toHaveLength(2);
      expect(audits[0].old_selling_price).toBe('20.00');
      expect(audits[0].new_selling_price).toBe('22.00');
      expect(audits[1].old_selling_price).toBe('22.00');
      expect(audits[1].new_selling_price).toBe('19.80');
    });

    it('should maintain transactional integrity - both product and audit created together', async () => {
      const initialProduct = await prisma.product.findUnique({
        where: { id: BigInt(productId) },
      });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // Verify product was updated
      const updatedProduct = await prisma.product.findUnique({
        where: { id: BigInt(productId) },
      });

      expect(updatedProduct).not.toBeNull();
      expect(initialProduct).not.toBeNull();
      expect(updatedProduct!.selling_price).not.toEqual(initialProduct!.selling_price);
      expect(response.body.product.selling_price).toBe('22.00');

      // Verify audit was created
      expect(response.body.audit).toHaveProperty('id');
    });

    it('should link audit to correct user', async () => {
      // Create another user
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (2, "Manager User", "manager@test.com", "0987654321", "hashed_password", "MANAGER", 1, NOW(), NOW())'
      );

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: 2, // Use different user
          note: 'Manager adjustment',
        })
        .expect(201);

      expect(response.body.audit.actor_user_id).toBe(2);

      // Verify through database query
      const audits = await prisma.$queryRaw<Array<any>>`
        SELECT * FROM price_change_audit_trails WHERE actor_user_id = ${2}
      `;

      expect(audits).toHaveLength(1);
    });

    it('should link audit to correct pricing rule', async () => {
      // Create another rule
      const secondRuleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Second Rule',
          rule_type: 'FIXED_PRICE',
          value: '18.00',
        });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${secondRuleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      expect(response.body.audit.pricing_rule_id).toBe(secondRuleResponse.body.id);
      expect(response.body.audit.pricing_rule_id).not.toBe(ruleId);
    });

    it('should preserve price history through audit trail', async () => {
      const originalPrice = '20.00';

      // Apply multiple changes
      await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleId}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'Change 1',
        });

      const decreaseRule = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Decrease',
          rule_type: 'PERCENT_DECREASE',
          value: '10.00',
        });

      await request(app.getHttpServer())
        .post(`/pricing-rules/${decreaseRule.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
          note: 'Change 2',
        });

      // Query all audits for this product
      const audits = await prisma.$queryRaw<Array<any>>`
        SELECT * FROM price_change_audit_trails WHERE product_id = ${productId} ORDER BY created_at ASC
      `;

      expect(audits).toHaveLength(2);
      expect(audits[0].old_selling_price).toBe(originalPrice);
      expect(audits[0].new_selling_price).toBe('22.00');
      expect(audits[1].old_selling_price).toBe('22.00');
      expect(audits[1].new_selling_price).toBe('19.80');
    });
  });

  describe('Price Calculation Edge Cases', () => {
    let userId: number;
    let productId: number;

    beforeEach(async () => {
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (1, "Admin User", "admin@test.com", "1234567890", "hashed_password", "ADMIN", 1, NOW(), NOW())'
      );
      userId = 1;

      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Test Product", "FOOD", 10.00, 5.00, 1, NOW(), NOW())'
      );
      productId = 1;
    });

    it('should handle zero percent increase correctly', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Zero Increase',
          rule_type: 'PERCENT_INCREASE',
          value: '0.00',
        });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      expect(response.body.product.selling_price).toBe('10.00');
    });

    it('should handle 100 percent increase correctly', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Double Price',
          rule_type: 'PERCENT_INCREASE',
          value: '100.00',
        });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      expect(response.body.product.selling_price).toBe('20.00');
    });

    it('should handle 100 percent decrease correctly', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Free',
          rule_type: 'PERCENT_DECREASE',
          value: '100.00',
        });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      expect(response.body.product.selling_price).toBe('0.00');
    });

    it('should round prices to 2 decimal places', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Odd Percentage',
          rule_type: 'PERCENT_INCREASE',
          value: '33.33',
        });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // 10.00 * 1.3333 = 13.333, should round to 13.33
      const price = parseFloat(response.body.product.selling_price);
      expect(price).toBeCloseTo(13.33, 2);
    });

    it('should handle very small decimal values', async () => {
      const ruleResponse = await request(app.getHttpServer())
        .post('/pricing-rules')
        .send({
          name: 'Tiny Increase',
          rule_type: 'PERCENT_INCREASE',
          value: '0.01',
        });

      const response = await request(app.getHttpServer())
        .post(`/pricing-rules/${ruleResponse.body.id}/apply`)
        .send({
          productId: productId,
          actorUserId: userId,
        })
        .expect(201);

      // 10.00 * 1.0001 = 10.001, should round to 10.00
      expect(response.body.product.selling_price).toBe('10.00');
    });
  });
});
