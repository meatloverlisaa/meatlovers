import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadStatus, LeadSource } from '@prisma/client';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async getLeads(status?: string, source?: string, limit?: number) {
    const where: any = {};

    if (status) {
      where.status = status as LeadStatus;
    }

    if (source) {
      where.source = source as LeadSource;
    }

    return this.prisma.websiteLead.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async updateLeadStatus(
    id: string,
    _updateLeadStatusDto: UpdateLeadStatusDto,
  ) {
    await this.findLead(id);

    return this.prisma.websiteLead.update({
      where: { id: BigInt(id) },
      data: { status: _updateLeadStatusDto.status },
    });
  }

  async getAnalytics() {
    const totalLeads = await this.prisma.websiteLead.count();
    const leadsByStatus = await this.prisma.websiteLead.groupBy({
      by: ['status'],
      _count: true,
    });

    const leadsBySource = await this.prisma.websiteLead.groupBy({
      by: ['source'],
      _count: true,
    });

    const convertedLeads = await this.prisma.websiteLead.count({
      where: { status: 'CONVERTED' },
    });

    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      total_leads: totalLeads,
      converted_leads: convertedLeads,
      conversion_rate: conversionRate.toFixed(2),
      leads_by_status: leadsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      leads_by_source: leadsBySource.map((item) => ({
        source: item.source,
        count: item._count,
      })),
    };
  }

  private async findLead(id: string) {
    const lead = await this.prisma.websiteLead.findUnique({
      where: { id: BigInt(id) },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }
}
