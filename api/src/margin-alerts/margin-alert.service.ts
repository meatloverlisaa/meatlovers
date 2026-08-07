// @ts-nocheck — Module disabled in AppModule, Prisma model not yet in schema

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMarginAlertDto } from './dto/update-margin-alert.dto';

@Injectable()
export class MarginAlertService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.marginAlert.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async updateStatus(id: number, updateDto: UpdateMarginAlertDto) {
    const existing = await this.prisma.marginAlert.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new NotFoundException(`Margin alert with ID ${id} not found`);
    }

    // Optional: prevent meaningless transitions (keeps behavior deterministic)
    if (existing.alert_status === updateDto.alert_status) {
      throw new BadRequestException('Alert is already in the requested status');
    }

    return this.prisma.marginAlert.update({
      where: { id: BigInt(id) },
      data: {
        alert_status: updateDto.alert_status,
        notes: updateDto.notes ?? existing.notes,
      },
    });
  }
}
