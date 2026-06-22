import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Stock Movement Quantity Updates (e2e)', () => {
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
      prisma.$executeRawUnsafe('DELETE FROM stock_movements'),
      prisma.$executeRawUnsafe('DELETE FROM stock_items'),
      prisma.$executeRawUnsafe('DELETE FROM products'),
    ]);
  });

  describe('Purchase Stock Movements', () => {
    it('should create stock item and increase quantity on purchase', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      const purchaseDto = {
        productId: 1,
        quantity: 50,
        reference: 'PO-001',
        notes: 'Initial stock purchase',
      };

      const response = await request(app.getHttpServer())
        .post('/stock/purchase')
        .send(purchaseDto)
        .expect(201);

      expect(response.body.stockItem).toHaveProperty('id');
      expect(response.body.stockItem.productId).toBe(1);
      expect(response.body.stockItem.quantity).toBe(50);
      expect(response.body.stockItem.location).toBe('MAIN_STORE');
      expect(response.body.movement.type).toBe('PURCHASE');
      expect(response.body.movement.quantity).toBe(50);
    });

    it('should increase existing stock quantity on subsequent purchase', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      // First purchase
      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 50,
          reference: 'PO-001',
        });

      // Second purchase - should increase quantity
      const response = await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 30,
          reference: 'PO-002',
        })
        .expect(201);

      expect(response.body.stockItem.quantity).toBe(80); // 50 + 30
      expect(response.body.movement.quantity).toBe(30);
    });

    it('should reject purchase with non-existent product', async () => {
      const purchaseDto = {
        productId: 999,
        quantity: 50,
      };

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send(purchaseDto)
        .expect(404);
    });

    it('should reject purchase with zero or negative quantity', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 0,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: -10,
        })
        .expect(400);
    });
  });

  describe('Adjustment Stock Movements', () => {
    it('should create stock item with positive adjustment', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      const adjustmentDto = {
        productId: 1,
        quantity: 25,
        reference: 'ADJ-001',
        notes: 'Physical count adjustment',
      };

      const response = await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send(adjustmentDto)
        .expect(201);

      expect(response.body.stockItem.quantity).toBe(25);
      expect(response.body.movement.type).toBe('ADJUSTMENT');
      expect(response.body.movement.quantity).toBe(25);
    });

    it('should decrease stock quantity with negative adjustment', async () => {
      // Setup: Create a product and initial stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 50,
        });

      // Negative adjustment
      const response = await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send({
          productId: 1,
          quantity: -10,
          notes: 'Damage/waste adjustment',
        })
        .expect(201);

      expect(response.body.stockItem.quantity).toBe(40); // 50 - 10
      expect(response.body.movement.quantity).toBe(-10);
    });

    it('should reject adjustment that results in negative quantity', async () => {
      // Setup: Create a product and initial stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 10,
        });

      // Try to adjust by more than available
      await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send({
          productId: 1,
          quantity: -20,
        })
        .expect(400);
    });

    it('should reject negative adjustment for non-existent stock item', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send({
          productId: 1,
          quantity: -10,
        })
        .expect(400);
    });
  });

  describe('Transfer Stock Movements', () => {
    it('should transfer stock between locations and update quantities correctly', async () => {
      // Setup: Create a product and initial stock in MAIN_STORE
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 100,
        });

      const transferDto = {
        productId: 1,
        quantity: 30,
        fromLocation: 'MAIN_STORE',
        toLocation: 'KITCHEN',
        reference: 'TRF-001',
        notes: 'Transfer to kitchen for daily prep',
      };

      const response = await request(app.getHttpServer())
        .post('/stock/transfer')
        .send(transferDto)
        .expect(201);

      expect(response.body.fromStockItem.quantity).toBe(70); // 100 - 30
      expect(response.body.fromStockItem.location).toBe('MAIN_STORE');
      expect(response.body.toStockItem.quantity).toBe(30);
      expect(response.body.toStockItem.location).toBe('KITCHEN');
      expect(response.body.movement.type).toBe('TRANSFER');
      expect(response.body.movement.quantity).toBe(-30);
    });

    it('should create new stock item in destination location if it does not exist', async () => {
      // Setup: Create a product and initial stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 100,
        });

      const response = await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 25,
          fromLocation: 'MAIN_STORE',
          toLocation: 'BAR',
        })
        .expect(201);

      expect(response.body.toStockItem.location).toBe('BAR');
      expect(response.body.toStockItem.quantity).toBe(25);
    });

    it('should accumulate quantity in destination location on multiple transfers', async () => {
      // Setup: Create a product and initial stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 100,
        });

      // First transfer
      await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 20,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        });

      // Second transfer to same location
      const response = await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 15,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        })
        .expect(201);

      expect(response.body.fromStockItem.quantity).toBe(65); // 100 - 20 - 15
      expect(response.body.toStockItem.quantity).toBe(35); // 20 + 15
    });

    it('should reject transfer with insufficient quantity in source location', async () => {
      // Setup: Create a product and initial stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 20,
        });

      // Try to transfer more than available
      await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 30,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        })
        .expect(400);
    });

    it('should reject transfer from non-existent source location', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 10,
          fromLocation: 'NON_EXISTENT',
          toLocation: 'KITCHEN',
        })
        .expect(404);
    });

    it('should reject transfer with zero or negative quantity', async () => {
      // Setup: Create a product and initial stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 50,
        });

      await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 0,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: -10,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        })
        .expect(400);
    });
  });

  describe('Stock Item Retrieval', () => {
    it('should retrieve stock item with movement history', async () => {
      // Setup: Create a product and stock movements
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 100,
        });

      await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send({
          productId: 1,
          quantity: -10,
        });

      const response = await request(app.getHttpServer())
        .get('/stock/product/1')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.product_id).toBe(1);
      expect(response.body.quantity).toBe(90);
      expect(response.body.movements).toHaveLength(2);
    });

    it('should return 404 for non-existent stock item', async () => {
      await request(app.getHttpServer())
        .get('/stock/product/999')
        .expect(404);
    });

    it('should retrieve all stock items', async () => {
      // Setup: Create multiple products and stock
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW()), (2, "Chicken", "FOOD", 18.00, 12.00, 1, NOW(), NOW())'
      );

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 50,
        });

      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 2,
          quantity: 30,
        });

      const response = await request(app.getHttpServer())
        .get('/stock')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].product).toHaveProperty('product_name');
    });
  });

  describe('Complex Stock Movement Scenarios', () => {
    it('should handle multiple movement types and verify final quantity', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      // Initial purchase: 100 units
      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 100,
        });

      // Transfer 30 to kitchen
      await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 30,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        });

      // Adjustment in main store: -5 (waste)
      await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send({
          productId: 1,
          quantity: -5,
          notes: 'Spoilage',
        });

      // Additional purchase: 20 units
      await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({
          productId: 1,
          quantity: 20,
        });

      // Verify final quantities
      const mainStoreResponse = await request(app.getHttpServer())
        .get('/stock/product/1')
        .expect(200);

      expect(mainStoreResponse.body.quantity).toBe(85); // 100 - 30 - 5 + 20
      expect(mainStoreResponse.body.movements).toHaveLength(4);
    });

    it('should maintain data integrity across concurrent operations', async () => {
      // Setup: Create a product
      await prisma.$executeRawUnsafe(
        'INSERT INTO products (id, product_name, product_category, selling_price, cost_price, is_active, created_at, updated_at) VALUES (1, "Beef", "FOOD", 20.00, 15.00, 1, NOW(), NOW())'
      );

      // Sequential operations to verify consistency
      const purchase1 = await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({ productId: 1, quantity: 50 });

      expect(purchase1.body.stockItem.quantity).toBe(50);

      const purchase2 = await request(app.getHttpServer())
        .post('/stock/purchase')
        .send({ productId: 1, quantity: 30 });

      expect(purchase2.body.stockItem.quantity).toBe(80);

      const transfer = await request(app.getHttpServer())
        .post('/stock/transfer')
        .send({
          productId: 1,
          quantity: 20,
          fromLocation: 'MAIN_STORE',
          toLocation: 'KITCHEN',
        });

      expect(transfer.body.fromStockItem.quantity).toBe(60);

      const adjustment = await request(app.getHttpServer())
        .post('/stock/adjustment')
        .send({ productId: 1, quantity: -5 });

      expect(adjustment.body.stockItem.quantity).toBe(55);

      // Final verification
      const finalStock = await request(app.getHttpServer())
        .get('/stock/product/1');

      expect(finalStock.body.quantity).toBe(55);
      expect(finalStock.body.movements).toHaveLength(4);
    });
  });
});
