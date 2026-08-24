import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  async getPages(publishedOnly?: boolean) {
    return this.prisma.content_pages.findMany({
      where: publishedOnly ? { is_published: true } : undefined,
      orderBy: { created_at: 'desc' },
    });
  }

  async createPage(createPageDto: CreatePageDto) {
    return this.prisma.content_pages.create({
      data: createPageDto,
    });
  }

  async updatePage(id: string, updatePageDto: UpdatePageDto) {
    await this.findPage(id);

    return this.prisma.content_pages.update({
      where: { id: BigInt(id) },
      data: updatePageDto,
    });
  }

  async togglePublish(id: string) {
    const page = await this.findPage(id);

    return this.prisma.content_pages.update({
      where: { id: BigInt(id) },
      data: { is_published: !page.is_published },
    });
  }

  private async findPage(id: string) {
    const page = await this.prisma.content_pages.findUnique({
      where: { id: BigInt(id) },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }
}
