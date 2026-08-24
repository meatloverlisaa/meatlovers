import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class WebsiteService {
  constructor(private prisma: PrismaService) {}

  async getHomepage() {
    const homepage = await this.prisma.contentPage.findFirst({
      where: { page_type: 'HOMEPAGE', is_published: true },
    });

    const menuHighlights = await this.prisma.product.findMany({
      where: { is_active: true },
      take: 12,
      orderBy: { created_at: 'desc' },
    });

    return {
      homepage,
      menu_highlights: menuHighlights,
      contact_info: {
        phone: '+254 700 000 000',
        email: 'info@meatlovers.co.ke',
        location: 'Nairobi, Kenya',
      },
    };
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.contentPage.findUnique({
      where: { slug },
    });

    if (!page || !page.is_published) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async getMenuHighlights() {
    const food = await this.prisma.product.findMany({
      where: { product_category: 'FOOD', is_active: true },
      take: 6,
      orderBy: { created_at: 'desc' },
    });

    const softDrinks = await this.prisma.product.findMany({
      where: { product_category: 'SOFT_DRINK', is_active: true },
      take: 4,
      orderBy: { created_at: 'desc' },
    });

    const alcoholicDrinks = await this.prisma.product.findMany({
      where: { product_category: 'ALCOHOLIC_DRINK', is_active: true },
      take: 4,
      orderBy: { created_at: 'desc' },
    });

    return {
      food,
      soft_drinks: softDrinks,
      alcoholic_drinks: alcoholicDrinks,
    };
  }

  async createLead(createLeadDto: CreateLeadDto) {
    return this.prisma.websiteLead.create({
      data: createLeadDto,
    });
  }
}
