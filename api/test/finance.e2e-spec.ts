import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionType, TransactionCategory } from '../src/finance/dto/create-finance-transaction.dto';

describe('Finance Transactions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUser: any;

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
    await prisma.$executeRawUnsafe('DELETE FROM finance_transactions');
    await prisma.$executeRawUnsafe('DELETE FROM waste_declarations');
    await prisma.$executeRawUnsafe('DELETE FROM users');

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        id: 100n,
        full_name: 'Test Accountant',
        email: 'accountant@meatlovers.com',
        password_hash: 'hashedpassword',
        role: 'ACCOUNTANT',
      },
    });
  });

  describe('POST /finance-transactions', () => {
    it('should create an income transaction', async () => {
      const createDto = {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES,
        amount: 5000.00,
        description: 'Daily sales revenue',
        reference: 'SALES-2024-001',
        recorded_by: String(testUser.id),
      };

      const response = await request(app.getHttpServer())
        .post('/finance-transactions')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(TransactionType.INCOME);
      expect(response.body.category).toBe(TransactionCategory.SALES);
      expect(Number(response.body.amount)).toBe(5000.00);
      expect(response.body.description).toBe('Daily sales revenue');
      expect(response.body.reference).toBe('SALES-2024-001');
      expect(response.body.recorded_by).toBe(String(testUser.id));
    });

    it('should create an expense transaction', async () => {
      const createDto = {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.SUPPLIER_PAYMENT,
        amount: 2500.00,
        description: 'Supplier payment for meat',
        reference: 'SUPP-2024-001',
        recorded_by: String(testUser.id),
      };

      const response = await request(app.getHttpServer())
        .post('/finance-transactions')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(TransactionType.EXPENSE);
      expect(response.body.category).toBe(TransactionCategory.SUPPLIER_PAYMENT);
      expect(Number(response.body.amount)).toBe(2500.00);
    });

    it('should reject transaction with zero or negative amount', async () => {
      const createDto = {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES,
        amount: -100.00,
        recorded_by: String(testUser.id),
      };

      await request(app.getHttpServer())
        .post('/finance-transactions')
        .send(createDto)
        .expect(400);
    });

    it('should reject transaction for non-existent user', async () => {
      const createDto = {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES,
        amount: 5000.00,
        recorded_by: '999',
      };

      await request(app.getHttpServer())
        .post('/finance-transactions')
        .send(createDto)
        .expect(404);
    });

    it('should accept custom transaction date', async () => {
      const customDate = '2024-01-15T10:00:00.000Z';
      const createDto = {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES,
        amount: 5000.00,
        recorded_by: String(testUser.id),
        transaction_date: customDate,
      };

      const response = await request(app.getHttpServer())
        .post('/finance-transactions')
        .send(createDto)
        .expect(201);

      expect(new Date(response.body.transaction_date).toISOString()).toBe(new Date(customDate).toISOString());
    });
  });

  describe('GET /finance-transactions', () => {
    beforeEach(async () => {
      // Seed some transactions with different dates
      const now = new Date();
      await prisma.financeTransaction.create({
        data: {
          type: TransactionType.INCOME,
          category: TransactionCategory.SALES,
          amount: 5000.00,
          recorded_by: testUser.id,
          transaction_date: new Date(now.getTime() - 60000), // 1 minute ago
        },
      });

      await prisma.financeTransaction.create({
        data: {
          type: TransactionType.EXPENSE,
          category: TransactionCategory.SUPPLIER_PAYMENT,
          amount: 2500.00,
          recorded_by: testUser.id,
          transaction_date: now, // now (most recent)
        },
      });
    });

    it('should return all finance transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].type).toBe(TransactionType.EXPENSE); // Ordered desc
      expect(response.body[1].type).toBe(TransactionType.INCOME);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions')
        .query({ type: TransactionType.INCOME })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe(TransactionType.INCOME);
    });

    it('should filter transactions by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions')
        .query({ category: TransactionCategory.SALES })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].category).toBe(TransactionCategory.SALES);
    });

    it('should filter transactions by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const response = await request(app.getHttpServer())
        .get('/finance-transactions')
        .query({
          startDate: yesterday.toISOString(),
          endDate: now.toISOString(),
        })
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should filter transactions by recorder', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions')
        .query({ recordedBy: String(testUser.id) })
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /finance-transactions/summary', () => {
    beforeEach(async () => {
      await prisma.financeTransaction.createMany({
        data: [
          {
            type: TransactionType.INCOME,
            category: TransactionCategory.SALES,
            amount: 5000.00,
            recorded_by: testUser.id,
          },
          {
            type: TransactionType.INCOME,
            category: TransactionCategory.SALES,
            amount: 3000.00,
            recorded_by: testUser.id,
          },
          {
            type: TransactionType.EXPENSE,
            category: TransactionCategory.SUPPLIER_PAYMENT,
            amount: 2500.00,
            recorded_by: testUser.id,
          },
          {
            type: TransactionType.EXPENSE,
            category: TransactionCategory.SALARY,
            amount: 1500.00,
            recorded_by: testUser.id,
          },
        ],
      });
    });

    it('should return correct finance aggregations', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .expect(200);

      expect(response.body.totalTransactions).toBe(4);
      expect(response.body.totalIncome).toBe(8000.00); // 5000 + 3000
      expect(response.body.totalExpenses).toBe(4000.00); // 2500 + 1500
      expect(response.body.netProfit).toBe(4000.00); // 8000 - 4000
    });

    it('should provide breakdown by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .expect(200);

      expect(response.body.byType[TransactionType.INCOME]).toBe(8000.00);
      expect(response.body.byType[TransactionType.EXPENSE]).toBe(4000.00);
    });

    it('should provide breakdown by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .expect(200);

      expect(response.body.byCategory[TransactionCategory.SALES]).toBe(8000.00);
      expect(response.body.byCategory[TransactionCategory.SUPPLIER_PAYMENT]).toBe(2500.00);
      expect(response.body.byCategory[TransactionCategory.SALARY]).toBe(1500.00);
    });

    it('should provide breakdown by recorder', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .expect(200);

      expect(response.body.byRecorder[testUser.full_name]).toBe(12000.00);
    });

    it('should filter summary by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .query({ type: TransactionType.INCOME })
        .expect(200);

      expect(response.body.totalIncome).toBe(8000.00);
      expect(response.body.totalExpenses).toBe(0);
      expect(response.body.netProfit).toBe(8000.00);
    });

    it('should filter summary by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .query({ category: TransactionCategory.SALES })
        .expect(200);

      expect(response.body.totalIncome).toBe(8000.00);
      expect(response.body.totalExpenses).toBe(0);
    });

    it('should reconcile sales income against operating expenses for a reporting period', async () => {
      await prisma.financeTransaction.deleteMany();

      const reportStart = '2024-02-01T00:00:00.000Z';
      const reportEnd = '2024-02-01T23:59:59.999Z';
      const reportDate = new Date('2024-02-01T12:00:00.000Z');
      const outsideReportDate = new Date('2024-02-02T12:00:00.000Z');

      await prisma.financeTransaction.createMany({
        data: [
          {
            type: TransactionType.INCOME,
            category: TransactionCategory.SALES,
            amount: 12000.00,
            recorded_by: testUser.id,
            transaction_date: reportDate,
          },
          {
            type: TransactionType.INCOME,
            category: TransactionCategory.SALES,
            amount: 3500.00,
            recorded_by: testUser.id,
            transaction_date: reportDate,
          },
          {
            type: TransactionType.EXPENSE,
            category: TransactionCategory.SUPPLIER_PAYMENT,
            amount: 4200.00,
            recorded_by: testUser.id,
            transaction_date: reportDate,
          },
          {
            type: TransactionType.EXPENSE,
            category: TransactionCategory.SALARY,
            amount: 1800.00,
            recorded_by: testUser.id,
            transaction_date: reportDate,
          },
          {
            type: TransactionType.EXPENSE,
            category: TransactionCategory.UTILITIES,
            amount: 650.00,
            recorded_by: testUser.id,
            transaction_date: reportDate,
          },
          {
            type: TransactionType.INCOME,
            category: TransactionCategory.SALES,
            amount: 9999.00,
            recorded_by: testUser.id,
            transaction_date: outsideReportDate,
          },
          {
            type: TransactionType.EXPENSE,
            category: TransactionCategory.RENT,
            amount: 9999.00,
            recorded_by: testUser.id,
            transaction_date: outsideReportDate,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/finance-transactions/summary')
        .query({ startDate: reportStart, endDate: reportEnd })
        .expect(200);

      expect(response.body.totalTransactions).toBe(5);
      expect(response.body.totalIncome).toBe(15500.00);
      expect(response.body.totalExpenses).toBe(6650.00);
      expect(response.body.netProfit).toBe(8850.00);
      expect(response.body.byType[TransactionType.INCOME]).toBe(15500.00);
      expect(response.body.byType[TransactionType.EXPENSE]).toBe(6650.00);
      expect(response.body.byCategory[TransactionCategory.SALES]).toBe(15500.00);
      expect(response.body.byCategory[TransactionCategory.SUPPLIER_PAYMENT]).toBe(4200.00);
      expect(response.body.byCategory[TransactionCategory.SALARY]).toBe(1800.00);
      expect(response.body.byCategory[TransactionCategory.UTILITIES]).toBe(650.00);
      expect(response.body.byCategory[TransactionCategory.RENT]).toBeUndefined();
    });
  });

  describe('GET /finance-transactions/:id', () => {
    it('should return a single finance transaction', async () => {
      const transaction = await prisma.financeTransaction.create({
        data: {
          type: TransactionType.INCOME,
          category: TransactionCategory.SALES,
          amount: 5000.00,
          recorded_by: testUser.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/finance-transactions/${transaction.id}`)
        .expect(200);

      expect(response.body.id).toBe(String(transaction.id));
      expect(response.body.type).toBe(TransactionType.INCOME);
    });

    it('should return 404 for non-existent transaction', async () => {
      await request(app.getHttpServer())
        .get('/finance-transactions/999')
        .expect(404);
    });
  });

  describe('PATCH /finance-transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const transaction = await prisma.financeTransaction.create({
        data: {
          type: TransactionType.INCOME,
          category: TransactionCategory.SALES,
          amount: 5000.00,
          recorded_by: testUser.id,
        },
      });
      transactionId = String(transaction.id);
    });

    it('should update finance transaction', async () => {
      const updateDto = {
        amount: 6000.00,
        description: 'Updated sales revenue',
      };

      const response = await request(app.getHttpServer())
        .patch(`/finance-transactions/${transactionId}`)
        .send(updateDto)
        .expect(200);

      expect(Number(response.body.amount)).toBe(6000.00);
      expect(response.body.description).toBe('Updated sales revenue');
    });

    it('should reject update with negative amount', async () => {
      const updateDto = {
        amount: -100.00,
      };

      await request(app.getHttpServer())
        .patch(`/finance-transactions/${transactionId}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject update with non-existent user', async () => {
      const updateDto = {
        recorded_by: '999',
      };

      await request(app.getHttpServer())
        .patch(`/finance-transactions/${transactionId}`)
        .send(updateDto)
        .expect(404);
    });

    it('should update transaction type and category', async () => {
      const updateDto = {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.MAINTENANCE,
      };

      const response = await request(app.getHttpServer())
        .patch(`/finance-transactions/${transactionId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.type).toBe(TransactionType.EXPENSE);
      expect(response.body.category).toBe(TransactionCategory.MAINTENANCE);
    });
  });

  describe('DELETE /finance-transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const transaction = await prisma.financeTransaction.create({
        data: {
          type: TransactionType.INCOME,
          category: TransactionCategory.SALES,
          amount: 5000.00,
          recorded_by: testUser.id,
        },
      });
      transactionId = String(transaction.id);
    });

    it('should delete finance transaction', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/finance-transactions/${transactionId}`)
        .expect(200);

      expect(response.body.message).toBe('Finance transaction deleted successfully');

      const deletedTransaction = await prisma.financeTransaction.findUnique({
        where: { id: BigInt(transactionId) },
      });

      expect(deletedTransaction).toBeNull();
    });

    it('should return 404 for non-existent transaction', async () => {
      await request(app.getHttpServer())
        .delete('/finance-transactions/999')
        .expect(404);
    });
  });
});
