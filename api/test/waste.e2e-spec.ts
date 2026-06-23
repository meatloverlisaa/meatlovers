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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
        selling_price: 35.50,
        cost_price: 20.00,
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
      expect(Number(response.body.cost_value)).toBe(200.00); // 10 * cost_price (20.00)

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
          cost_value: 100.00,
          declared_at: new Date(now.getTime() - 60000), // 1 minute ago
        },
      });

      await prisma.wasteDeclaration.create({
        data: {
          product_id: testProduct.id,
          quantity: 10,
          reason: WasteReason.THEFT,
          declared_by: testUser.id,
          cost_value: 200.00,
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
            cost_value: 100.00,
          },
          {
            product_id: testProduct.id,
            quantity: 10,
            reason: WasteReason.THEFT,
            declared_by: testUser.id,
            cost_value: 200.00,
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
      expect(response.body.totalCostValue).toBe(300.00);
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
          cost_value: 200.00,
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
      expect(response.body.notes).toBe('More was spoiled than initially counted');
      expect(Number(response.body.cost_value)).toBe(300.00);

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
          cost_value: 200.00,
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
});
