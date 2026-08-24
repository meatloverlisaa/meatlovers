import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PageType } from '@prisma/client';

@Injectable()
export class ManagerCmsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all pages with optional published filter
   */
  async getPages(publishedOnly?: boolean) {
    return this.prisma.content_pages.findMany({
      where: publishedOnly ? { is_published: true } : undefined,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        page_type: true,
        content: true,
        is_published: true,
        meta_title: true,
        meta_description: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  /**
   * Get a specific page by ID
   */
  async getPageById(id: string) {
    const page = await this.prisma.content_pages.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        title: true,
        slug: true,
        page_type: true,
        content: true,
        is_published: true,
        meta_title: true,
        meta_description: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return page;
  }

  /**
   * Get a specific page by slug
   */
  async getPageBySlug(slug: string) {
    const page = await this.prisma.content_pages.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        page_type: true,
        content: true,
        is_published: true,
        meta_title: true,
        meta_description: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with slug '${slug}' not found`);
    }

    return page;
  }

  /**
   * Get CMS statistics for oversight
   */
  async getCmsStats() {
    const [totalPages, publishedPages, draftPages, pagesByType] =
      await Promise.all([
        // Total pages
        this.prisma.content_pages.count(),

        // Published pages
        this.prisma.content_pages.count({
          where: { is_published: true },
        }),

        // Draft pages
        this.prisma.content_pages.count({
          where: { is_published: false },
        }),

        // Pages grouped by type
        this.prisma.content_pages.groupBy({
          by: ['page_type'],
          _count: {
            id: true,
          },
        }),
      ]);

    // Transform page type stats to a more readable format
    const pageTypeStats = pagesByType.reduce(
      (acc, item) => {
        acc[item.page_type] = item._count.id;
        return acc;
      },
      {} as Record<PageType, number>,
    );

    return {
      total: totalPages,
      published: publishedPages,
      draft: draftPages,
      byType: pageTypeStats,
    };
  }
}
