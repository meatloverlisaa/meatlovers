import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

describe('HR documents (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userId: bigint;

  beforeAll(async () => {
    jest.setTimeout(30000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prismaService = app.get<PrismaService>(PrismaService);

    const user = await prismaService.user.create({
      data: {
        full_name: 'HR Upload User',
        email: 'hr-upload@test.com',
        phone: '+254700000099',
        password_hash: await bcrypt.hash('TestPassword123!', 12),
        role: Role.HR,
        is_active: true,
        failed_login_attempts: 0,
        password_changed_at: new Date(),
      },
    });

    userId = user.id;
  });

  afterAll(async () => {
    await prismaService.employeeDocument.deleteMany({
      where: { user_id: userId },
    });
    await prismaService.user.delete({
      where: { id: userId },
    });
    await app.close();
  });

  it('should upload an employee document via multipart form', async () => {
    const response = await request(app.getHttpServer())
      .post('/hrm/documents')
      .field('user_id', userId.toString())
      .field('uploaded_by', userId.toString())
      .field('document_type', 'PASSPORT')
      .field('document_name', 'passport.pdf')
      .field('notes', 'Uploaded by HR test')
      .attach('file', Buffer.from('dummy-pdf-content'), {
        filename: 'passport.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      document_name: 'passport.pdf',
      user_id: userId.toString(),
      document_type: 'PASSPORT',
    });
    expect(response.body.document_url).toContain('/uploads/hr-documents/');
  });
});
