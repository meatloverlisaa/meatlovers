import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Suppliers (e2e)', () => {
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
    await prisma.$executeRawUnsafe('DELETE FROM suppliers');
  });

  describe('Supplier Registration', () => {
    it('should register a supplier with valid data', async () => {
      const createSupplierDto = {
        supplier_name: 'Fresh Foods Ltd',
        contact_person: 'John Doe',
        phone: '+254712345678',
        email: 'john@freshfoods.com',
        physical_address: '123 Industrial Area, Nairobi',
        supplier_type: 'FOOD',
      };

      const response = await request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.supplier_name).toBe('Fresh Foods Ltd');
      expect(response.body.contact_person).toBe('John Doe');
      expect(response.body.phone).toBe('+254712345678');
      expect(response.body.email).toBe('john@freshfoods.com');
      expect(response.body.physical_address).toBe('123 Industrial Area, Nairobi');
      expect(response.body.supplier_type).toBe('FOOD');
      expect(response.body.status).toBe('ACTIVE'); // Default status
    });

    it('should register a supplier with only required fields', async () => {
      const createSupplierDto = {
        supplier_name: 'Beverage Co',
        supplier_type: 'SOFT_DRINKS',
      };

      const response = await request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.supplier_name).toBe('Beverage Co');
      expect(response.body.supplier_type).toBe('SOFT_DRINKS');
      expect(response.body.status).toBe('ACTIVE');
      expect(response.body.contact_person).toBeNull();
      expect(response.body.phone).toBeNull();
      expect(response.body.email).toBeNull();
      expect(response.body.physical_address).toBeNull();
    });

    it('should reject supplier registration without supplier_name', async () => {
      const createSupplierDto = {
        contact_person: 'John Doe',
        supplier_type: 'FOOD',
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(400);
    });

    it('should reject supplier registration without supplier_type', async () => {
      const createSupplierDto = {
        supplier_name: 'Fresh Foods Ltd',
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(400);
    });

    it('should reject supplier registration with invalid email', async () => {
      const createSupplierDto = {
        supplier_name: 'Fresh Foods Ltd',
        email: 'invalid-email',
        supplier_type: 'FOOD',
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(400);
    });

    it('should reject supplier registration with invalid supplier_type', async () => {
      const createSupplierDto = {
        supplier_name: 'Fresh Foods Ltd',
        supplier_type: 'INVALID_TYPE',
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(400);
    });

    it('should register suppliers of all valid types', async () => {
      const supplierTypes = ['FOOD', 'SOFT_DRINKS', 'ALCOHOL', 'GENERAL'];

      for (const type of supplierTypes) {
        const createSupplierDto = {
          supplier_name: `${type} Supplier`,
          supplier_type: type,
        };

        const response = await request(app.getHttpServer())
          .post('/suppliers')
          .send(createSupplierDto)
          .expect(201);

        expect(response.body.supplier_type).toBe(type);
      }
    });
  });

  describe('Supplier Status Toggling', () => {
    let supplierId: number;

    beforeEach(async () => {
      // Create a test supplier
      const supplier = await prisma.supplier.create({
        data: {
          supplier_name: 'Test Supplier',
          supplier_type: 'FOOD',
          status: 'ACTIVE',
        },
      });
      supplierId = Number(supplier.id);
    });

    it('should toggle supplier status from ACTIVE to SUSPENDED', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({ status: 'SUSPENDED' })
        .expect(200);

      expect(response.body.status).toBe('SUSPENDED');
      expect(response.body.supplier_name).toBe('Test Supplier');
    });

    it('should toggle supplier status from SUSPENDED to ACTIVE', async () => {
      // First suspend the supplier
      await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({ status: 'SUSPENDED' });

      // Then reactivate
      const response = await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({ status: 'ACTIVE' })
        .expect(200);

      expect(response.body.status).toBe('ACTIVE');
    });

    it('should update other fields along with status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({
          status: 'SUSPENDED',
          contact_person: 'Jane Smith',
          phone: '+254798765432',
        })
        .expect(200);

      expect(response.body.status).toBe('SUSPENDED');
      expect(response.body.contact_person).toBe('Jane Smith');
      expect(response.body.phone).toBe('+254798765432');
    });

    it('should reject status update with invalid status value', async () => {
      await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should allow updating supplier without changing status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({
          contact_person: 'New Contact',
          email: 'newcontact@example.com',
        })
        .expect(200);

      expect(response.body.status).toBe('ACTIVE'); // Status unchanged
      expect(response.body.contact_person).toBe('New Contact');
      expect(response.body.email).toBe('newcontact@example.com');
    });

    it('should verify status persists after retrieval', async () => {
      // Suspend the supplier
      await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({ status: 'SUSPENDED' });

      // Retrieve the supplier
      const response = await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .expect(200);

      expect(response.body.status).toBe('SUSPENDED');
    });
  });

  describe('Supplier Retrieval', () => {
    it('should retrieve all suppliers ordered by creation date', async () => {
      // Create multiple suppliers
      await prisma.supplier.create({
        data: {
          supplier_name: 'First Supplier',
          supplier_type: 'FOOD',
        },
      });

      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

      await prisma.supplier.create({
        data: {
          supplier_name: 'Second Supplier',
          supplier_type: 'SOFT_DRINKS',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/suppliers')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].supplier_name).toBe('Second Supplier'); // Most recent first
      expect(response.body[1].supplier_name).toBe('First Supplier');
    });

    it('should retrieve a single supplier by ID', async () => {
      const supplier = await prisma.supplier.create({
        data: {
          supplier_name: 'Specific Supplier',
          supplier_type: 'ALCOHOL',
          contact_person: 'Bob Johnson',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/suppliers/${Number(supplier.id)}`)
        .expect(200);

      expect(response.body.id).toBe(String(supplier.id));
      expect(response.body.supplier_name).toBe('Specific Supplier');
      expect(response.body.supplier_type).toBe('ALCOHOL');
      expect(response.body.contact_person).toBe('Bob Johnson');
    });

    it('should return 404 for non-existent supplier', async () => {
      await request(app.getHttpServer())
        .get('/suppliers/99999')
        .expect(404);
    });
  });

  describe('Supplier Deletion', () => {
    it('should delete a supplier', async () => {
      const supplier = await prisma.supplier.create({
        data: {
          supplier_name: 'To Be Deleted',
          supplier_type: 'GENERAL',
        },
      });

      await request(app.getHttpServer())
        .delete(`/suppliers/${Number(supplier.id)}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/suppliers/${Number(supplier.id)}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent supplier', async () => {
      await request(app.getHttpServer())
        .delete('/suppliers/99999')
        .expect(404);
    });
  });

  describe('Full Supplier Life-cycle Integration Test', () => {
    it('should complete full supplier life-cycle: create, update status, retrieve, and delete', async () => {
      // Step 1: Create supplier (ACTIVE by default)
      const createResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          supplier_name: 'Life-cycle Supplier',
          contact_person: 'Initial Contact',
          supplier_type: 'FOOD',
        })
        .expect(201);

      const supplierId = createResponse.body.id;
      expect(createResponse.body.status).toBe('ACTIVE');

      // Step 2: Update supplier details and suspend
      const updateResponse = await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({
          contact_person: 'Updated Contact',
          phone: '+254700000000',
          status: 'SUSPENDED',
        })
        .expect(200);

      expect(updateResponse.body.contact_person).toBe('Updated Contact');
      expect(updateResponse.body.phone).toBe('+254700000000');
      expect(updateResponse.body.status).toBe('SUSPENDED');

      // Step 3: Reactivate supplier
      const reactivateResponse = await request(app.getHttpServer())
        .patch(`/suppliers/${supplierId}`)
        .send({ status: 'ACTIVE' })
        .expect(200);

      expect(reactivateResponse.body.status).toBe('ACTIVE');

      // Step 4: Retrieve and verify final state
      const retrieveResponse = await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .expect(200);

      expect(retrieveResponse.body.supplier_name).toBe('Life-cycle Supplier');
      expect(retrieveResponse.body.contact_person).toBe('Updated Contact');
      expect(retrieveResponse.body.phone).toBe('+254700000000');
      expect(retrieveResponse.body.status).toBe('ACTIVE');

      // Step 5: Delete supplier
      await request(app.getHttpServer())
        .delete(`/suppliers/${supplierId}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .expect(404);
    });
  });
});
