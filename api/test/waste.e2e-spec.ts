import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WasteReason } from '../src/waste/dto/create-waste-declaration.dto';

describe('Waste Declarations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUser: any;
  let testProduct: any;
  let testStockItem: any;

  beforeAll(async () => {
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
    // Clear dependencies and test data in correct order
    await prisma.$executeRawUnsafe('DELETE FROM waste_declarations');
    await prisma.$executeRawUnsafe('DELETE FROM stock_movements');
    await prisma.$executeRawUnsafe('DELETE FROM stock_items');
    await prisma.$executeRawUnsafe('DELETE FROM products');
    await prisma.$executeRawUnsafe('DELETE FROM users');

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        id: 100n,
        full_name: 'Test Chef',
        email: 'chef@meatlovers.com',
        password_hash: 'hashedpassword',
        role: 'CHEF',
      },
    });

    // Create a test product
    testProduct = await prisma.product.create({
      data: {
        id: 200n,
        product_name: 'Cooked Ribs',
        product_category: 'FOOD',
        selling_price: 35.5,
        cost_price: 20.0,
      },
    });

    // Create a test stock item for the product
    testStockItem = await prisma.stockItem.create({
      data: {
        id: 300n,
        product_id: testProduct.id,
        quantity: 50,
        location: 'MAIN_STORE',
      },
    });
  });

  describe('POST /waste-declarations', () => {
    it('should create a waste declaration and deduct stock quantity', async () => {
      const createDto = {
        product_id: String(testProduct.id),
        quantity: 10,
        reason: WasteReason.THEFT,
        notes: 'Disappeared from kitchen',
        declared_by: String(testUser.id),
      };

      const response = await request(app.getHttpServer())
        .post('/waste-declarations')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.product_id).toBe(String(testProduct.id));
      expect(response.body.quantity).toBe(10);
      expect(response.body.reason).toBe(WasteReason.THEFT);
      expect(response.body.notes).toBe('Disappeared from kitchen');
      expect(response.body.declared_by).toBe(String(testUser.id));
      expect(Number(response.body.cost_value)).toBe(200.0); // 10 * cost_price (20.00)

      // Verify stock was updated
      const updatedStock = await prisma.stockItem.findUnique({
        where: { id: testStockItem.id },
      });
      expect(updatedStock?.quantity).toBe(40); // 50 - 10

      // Verify stock movement was created
      const movements = await prisma.stockMovement.findMany({
        where: { stock_item_id: testStockItem.id },
      });
      expect(movements).toHaveLength(1);
      expect(movements[0].movement_type).toBe('WASTE');
      expect(movements[0].quantity).toBe(-10);
    });

    it('should reject declaration with insufficient stock', async () => {
      const createDto = {
        product_id: String(testProduct.id),
        quantity: 60, // Exceeds stock (50)
        reason: WasteReason.SPOILED,
        declared_by: String(testUser.id),
      };

      await request(app.getHttpServer())
        .post('/waste-declarations')
        .send(createDto)
        .expect(400);
    });

    it('should reject declaration for non-existent product', async () => {
      const createDto = {
        product_id: '999',
        quantity: 5,
        reason: WasteReason.EXPIRED,
        declared_by: String(testUser.id),
      };

      await request(app.getHttpServer())
        .post('/waste-declarations')
        .send(createDto)
        .expect(404);
    });
  });

  describe('GET /waste-declarations', () => {
    beforeEach(async () => {
      // Seed some waste declarations with different declared_at timestamps to test sorting desc
      const now = new Date();
      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 5,
          reason: WasteReason.SPOILED,
          declared_by: testUser.id,
          cost_value: 100.0,
          declared_at: new Date(now.getTime() - 60000), // 1 minute ago
        },
      });

      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.THEFT,
          declared_by: testUser.id,
          cost_value: 200.0,
          declared_at: now, // now (most recent)
        },
      });
    });

    it('should return all waste declarations', async () => {
      const response = await request(app.getHttpServer())
        .get('/waste-declarations')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].reason).toBe(WasteReason.THEFT); // Ordered desc
      expect(response.body[1].reason).toBe(WasteReason.SPOILED);
    });

    it('should filter waste declarations by reason', async () => {
      const response = await request(app.getHttpServer())
        .get('/waste-declarations')
        .query({ reason: WasteReason.SPOILED })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].reason).toBe(WasteReason.SPOILED);
    });
  });

  describe('GET /waste-declarations/summary', () => {
    beforeEach(async () => {
      await prisma.wasteDeclaration.createMany({
        data: [
          {
            product_id: testProduct.id,
            quantity: 5,
            reason: WasteReason.SPOILED,
            declared_by: testUser.id,
            cost_value: 100.0,
          },
          {
            product_id: testProduct.id,
            quantity: 10,
            reason: WasteReason.THEFT,
            declared_by: testUser.id,
            cost_value: 200.0,
          },
        ],
      });
    });

    it('should return correct waste aggregations', async () => {
      const response = await request(app.getHttpServer())
        .get('/waste-declarations/summary')
        .expect(200);

      expect(response.body.totalDeclarations).toBe(2);
      expect(response.body.totalQuantity).toBe(15);
      expect(response.body.totalCostValue).toBe(300.0);
      expect(response.body.byReason[WasteReason.SPOILED]).toBe(5);
      expect(response.body.byReason[WasteReason.THEFT]).toBe(10);
      expect(response.body.byProduct[testProduct.product_name]).toBe(15);
      expect(response.body.byDeclarer[testUser.full_name]).toBe(15);
    });
  });

  describe('PATCH /waste-declarations/:id', () => {
    let declarationId: string;

    beforeEach(async () => {
      const declaration = await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: testUser.id,
          cost_value: 200.0,
        },
      });
      declarationId = String(declaration.id);

      // Decrement stock quantity since we created the declaration directly
      await prisma.stockItem.update({
        where: { id: testStockItem.id },
        data: { quantity: 40 },
      });
    });

    it('should update waste declaration and adjust stock quantity accordingly', async () => {
      // Update quantity from 10 to 15 (should deduct another 5 from stock)
      const updateDto = {
        quantity: 15,
        notes: 'More was spoiled than initially counted',
      };

      const response = await request(app.getHttpServer())
        .patch(`/waste-declarations/${declarationId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.quantity).toBe(15);
      expect(response.body.notes).toBe(
        'More was spoiled than initially counted',
      );
      expect(Number(response.body.cost_value)).toBe(300.0);

      // Stock should go from 40 to 35
      const updatedStock = await prisma.stockItem.findUnique({
        where: { id: testStockItem.id },
      });
      expect(updatedStock?.quantity).toBe(35);
    });
  });

  describe('DELETE /waste-declarations/:id', () => {
    let declarationId: string;

    beforeEach(async () => {
      const declaration = await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: testUser.id,
          cost_value: 200.0,
        },
      });
      declarationId = String(declaration.id);

      // Decrement stock quantity since we created the declaration directly
      await prisma.stockItem.update({
        where: { id: testStockItem.id },
        data: { quantity: 40 },
      });
    });

    it('should delete waste declaration and restore stock quantity', async () => {
      await request(app.getHttpServer())
        .delete(`/waste-declarations/${declarationId}`)
        .expect(200);

      // Stock should go from 40 back to 50
      const updatedStock = await prisma.stockItem.findUnique({
        where: { id: testStockItem.id },
      });
      expect(updatedStock?.quantity).toBe(50);
    });
  });

  describe('Inventory Audit Trail', () => {
    it('should create complete audit trail for waste declaration', async () => {
      const createDto = {
        product_id: String(testProduct.id),
        quantity: 10,
        reason: WasteReason.THEFT,
        notes: 'Disappeared from kitchen',
        declared_by: String(testUser.id),
      };

      const response = await request(app.getHttpServer())
        .post('/waste-declarations')
        .send(createDto)
        .expect(201);

      const wasteId = response.body.id;

      // Verify stock movement has complete audit information
      const movements = await prisma.stockMovement.findMany({
        where: { stock_item_id: testStockItem.id },
      });

      expect(movements).toHaveLength(1);
      expect(movements[0].movement_type).toBe('WASTE');
      expect(movements[0].quantity).toBe(-10);
      expect(movements[0].reference).toContain(`Waste Declaration #${wasteId}`);
      expect(movements[0].notes).toContain('THEFT');
      expect(movements[0].notes).toContain('Disappeared from kitchen');
      expect(movements[0].created_at).toBeDefined();
    });

    it('should maintain audit trail when waste quantity is updated', async () => {
      // Create initial waste declaration
      const createResponse = await request(app.getHttpServer())
        .post('/waste-declarations')
        .send({
          product_id: String(testProduct.id),
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: String(testUser.id),
        })
        .expect(201);

      const wasteId = createResponse.body.id;

      // Update quantity
      await request(app.getHttpServer())
        .patch(`/waste-declarations/${wasteId}`)
        .send({ quantity: 15 })
        .expect(200);

      // Verify both movements exist in audit trail
      const movements = await prisma.stockMovement.findMany({
        where: { stock_item_id: testStockItem.id },
        orderBy: { created_at: 'asc' },
      });

      expect(movements).toHaveLength(2);

      // First movement: initial waste
      expect(movements[0].movement_type).toBe('WASTE');
      expect(movements[0].quantity).toBe(-10);
      expect(movements[0].reference).toContain(`Waste Declaration #${wasteId}`);

      // Second movement: adjustment for quantity change
      expect(movements[1].movement_type).toBe('ADJUSTMENT');
      expect(movements[1].quantity).toBe(-5); // Additional 5 deducted
      expect(movements[1].reference).toContain(
        `Waste Declaration Adjustment #${wasteId}`,
      );
      expect(movements[1].notes).toContain('10 to 15');
    });

    it('should create reversal audit trail when waste is deleted', async () => {
      // Create waste declaration
      const createResponse = await request(app.getHttpServer())
        .post('/waste-declarations')
        .send({
          product_id: String(testProduct.id),
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: String(testUser.id),
        })
        .expect(201);

      const wasteId = createResponse.body.id;

      // Delete waste declaration
      await request(app.getHttpServer())
        .delete(`/waste-declarations/${wasteId}`)
        .expect(200);

      // Verify both movements exist in audit trail
      const movements = await prisma.stockMovement.findMany({
        where: { stock_item_id: testStockItem.id },
        orderBy: { created_at: 'asc' },
      });

      expect(movements).toHaveLength(2);

      // First movement: initial waste
      expect(movements[0].movement_type).toBe('WASTE');
      expect(movements[0].quantity).toBe(-10);

      // Second movement: reversal/restoration
      expect(movements[1].movement_type).toBe('ADJUSTMENT');
      expect(movements[1].quantity).toBe(10); // Stock restored
      expect(movements[1].reference).toContain(
        `Waste Declaration Reversal #${wasteId}`,
      );
      expect(movements[1].notes).toContain(
        `Reversed waste declaration #${wasteId}`,
      );
    });

    it('should support date-range filtering for audit purposes', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      // Create waste declarations with different dates
      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 5,
          reason: WasteReason.SPOILED,
          declared_by: testUser.id,
          cost_value: 100.0,
          declared_at: twoDaysAgo,
        },
      });

      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.THEFT,
          declared_by: testUser.id,
          cost_value: 200.0,
          declared_at: yesterday,
        },
      });

      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 15,
          reason: WasteReason.EXPIRED,
          declared_by: testUser.id,
          cost_value: 300.0,
          declared_at: now,
        },
      });

      // Filter by date range (yesterday to now)
      const response = await request(app.getHttpServer())
        .get('/waste-declarations')
        .query({
          startDate: yesterday.toISOString(),
          endDate: now.toISOString(),
        })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(
        response.body.every(
          (w: any) =>
            new Date(w.declared_at) >= yesterday &&
            new Date(w.declared_at) <= now,
        ),
      ).toBe(true);
    });
  });

  describe('P&L Impact Verification', () => {
    it('should calculate accurate cost value for waste declarations', async () => {
      const createDto = {
        product_id: String(testProduct.id),
        quantity: 10,
        reason: WasteReason.SPOILED,
        declared_by: String(testUser.id),
      };

      const response = await request(app.getHttpServer())
        .post('/waste-declarations')
        .send(createDto)
        .expect(201);

      // Cost value should be quantity * cost_price (10 * 20.00 = 200.00)
      expect(Number(response.body.cost_value)).toBe(200.0);
    });

    it('should aggregate waste costs correctly for P&L reporting', async () => {
      // Create multiple waste declarations
      await prisma.wasteDeclaration.createMany({
        data: [
          {
            product_id: testProduct.id,
            quantity: 5,
            reason: WasteReason.SPOILED,
            declared_by: testUser.id,
            cost_value: 100.0,
          },
          {
            product_id: testProduct.id,
            quantity: 10,
            reason: WasteReason.THEFT,
            declared_by: testUser.id,
            cost_value: 200.0,
          },
          {
            product_id: testProduct.id,
            quantity: 15,
            reason: WasteReason.EXPIRED,
            declared_by: testUser.id,
            cost_value: 300.0,
          },
        ],
      });

      const summaryResponse = await request(app.getHttpServer())
        .get('/waste-declarations/summary')
        .expect(200);

      // Total cost value should be 100 + 200 + 300 = 600
      expect(summaryResponse.body.totalCostValue).toBe(600.0);
      expect(summaryResponse.body.totalQuantity).toBe(30);
      expect(summaryResponse.body.totalDeclarations).toBe(3);
    });

    it('should update cost value when quantity is changed', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/waste-declarations')
        .send({
          product_id: String(testProduct.id),
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: String(testUser.id),
        })
        .expect(201);

      expect(Number(createResponse.body.cost_value)).toBe(200.0);

      // Update quantity to 15
      const updateResponse = await request(app.getHttpServer())
        .patch(`/waste-declarations/${createResponse.body.id}`)
        .send({ quantity: 15 })
        .expect(200);

      // New cost value should be 15 * 20.00 = 300.00
      expect(Number(updateResponse.body.cost_value)).toBe(300.0);
    });

    it('should provide waste breakdown by reason for P&L analysis', async () => {
      await prisma.wasteDeclaration.createMany({
        data: [
          {
            product_id: testProduct.id,
            quantity: 5,
            reason: WasteReason.SPOILED,
            declared_by: testUser.id,
            cost_value: 100.0,
          },
          {
            product_id: testProduct.id,
            quantity: 5,
            reason: WasteReason.SPOILED,
            declared_by: testUser.id,
            cost_value: 100.0,
          },
          {
            product_id: testProduct.id,
            quantity: 10,
            reason: WasteReason.THEFT,
            declared_by: testUser.id,
            cost_value: 200.0,
          },
        ],
      });

      const summaryResponse = await request(app.getHttpServer())
        .get('/waste-declarations/summary')
        .expect(200);

      // Verify breakdown by reason
      expect(summaryResponse.body.byReason[WasteReason.SPOILED]).toBe(10);
      expect(summaryResponse.body.byReason[WasteReason.THEFT]).toBe(10);
    });

    it('should provide waste breakdown by product for P&L analysis', async () => {
      // Create another product
      const testProduct2 = await prisma.product.create({
        data: {
          id: 201n,
          product_name: 'Grilled Chicken',
          product_category: 'FOOD',
          selling_price: 25.0,
          cost_price: 15.0,
        },
      });

      const testStockItem2 = await prisma.stockItem.create({
        data: {
          id: 301n,
          product_id: testProduct2.id,
          quantity: 30,
          location: 'MAIN_STORE',
        },
      });

      // Create waste for both products
      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: testUser.id,
          cost_value: 200.0,
        },
      });

      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct2.id,
          quantity: 5,
          reason: WasteReason.THEFT,
          declared_by: testUser.id,
          cost_value: 75.0,
        },
      });

      const summaryResponse = await request(app.getHttpServer())
        .get('/waste-declarations/summary')
        .expect(200);

      // Verify breakdown by product
      expect(summaryResponse.body.byProduct[testProduct.product_name]).toBe(10);
      expect(summaryResponse.body.byProduct[testProduct2.product_name]).toBe(5);
    });

    it('should track cumulative waste impact over time', async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Create waste over time
      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.SPOILED,
          declared_by: testUser.id,
          cost_value: 200.0,
          declared_at: oneWeekAgo,
        },
      });

      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 15,
          reason: WasteReason.THEFT,
          declared_by: testUser.id,
          cost_value: 300.0,
          declared_at: now,
        },
      });

      // Get summary for the entire period
      const fullSummary = await request(app.getHttpServer())
        .get('/waste-declarations/summary')
        .expect(200);

      expect(fullSummary.body.totalCostValue).toBe(500.0);

      // Get summary for just this week
      const weeklySummary = await request(app.getHttpServer())
        .get('/waste-declarations/summary')
        .query({ startDate: oneWeekAgo.toISOString() })
        .expect(200);

      expect(weeklySummary.body.totalCostValue).toBe(500.0);
    });
  });
});
