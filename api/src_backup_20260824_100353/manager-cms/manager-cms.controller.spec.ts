import { Test, TestingModule } from '@nestjs/testing';
import { ManagerCmsController } from './manager-cms.controller';
import { ManagerCmsService } from './manager-cms.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ManagerCmsController', () => {
  let controller: ManagerCmsController;
  let service: ManagerCmsService;

  const mockPrismaService = {
    contentPage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerCmsController],
      providers: [
        ManagerCmsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ManagerCmsController>(ManagerCmsController);
    service = module.get<ManagerCmsService>(ManagerCmsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getPages', () => {
    it('should return all pages when published filter is not set', async () => {
      const mockPages = [
        {
          id: BigInt(1),
          title: 'Test Page',
          slug: 'test-page',
          page_type: 'CUSTOM',
          content: '<p>Test</p>',
          is_published: true,
          meta_title: 'Test',
          meta_description: 'Test description',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.content_pages.findMany.mockResolvedValue(mockPages);

      const result = await controller.getPages();
      expect(result).toEqual(mockPages);
      expect(mockPrismaService.content_pages.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { created_at: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should return only published pages when published=true', async () => {
      const mockPages = [
        {
          id: BigInt(1),
          title: 'Published Page',
          slug: 'published-page',
          page_type: 'CUSTOM',
          content: '<p>Published</p>',
          is_published: true,
          meta_title: 'Published',
          meta_description: 'Published description',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.content_pages.findMany.mockResolvedValue(mockPages);

      const result = await controller.getPages('true');
      expect(result).toEqual(mockPages);
      expect(mockPrismaService.content_pages.findMany).toHaveBeenCalledWith({
        where: { is_published: true },
        orderBy: { created_at: 'desc' },
        select: expect.any(Object),
      });
    });
  });

  describe('getCmsStats', () => {
    it('should return CMS statistics', async () => {
      mockPrismaService.content_pages.count
        .mockResolvedValueOnce(15) // total
        .mockResolvedValueOnce(12) // published
        .mockResolvedValueOnce(3); // draft

      mockPrismaService.content_pages.groupBy.mockResolvedValue([
        { page_type: 'CUSTOM', _count: { id: 10 } },
        { page_type: 'HOMEPAGE', _count: { id: 1 } },
        { page_type: 'BLOG', _count: { id: 4 } },
      ]);

      const result = await controller.getCmsStats();

      expect(result).toEqual({
        total: 15,
        published: 12,
        draft: 3,
        byType: {
          CUSTOM: 10,
          HOMEPAGE: 1,
          BLOG: 4,
        },
      });
    });
  });
});
