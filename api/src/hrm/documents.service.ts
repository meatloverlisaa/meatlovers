import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upload employee document
   */
  async uploadDocument(data: {
    user_id: string;
    uploaded_by: string;
    document_type: DocumentType;
    document_name: string;
    document_url: string;
    file_size?: number;
    issue_date?: string;
    expiry_date?: string;
    notes?: string;
  }) {
    return this.prisma.employeeDocument.create({
      data: {
        user_id: BigInt(data.user_id),
        uploaded_by: BigInt(data.uploaded_by),
        document_type: data.document_type,
        document_name: data.document_name,
        document_url: data.document_url,
        file_size: data.file_size,
        issue_date: data.issue_date ? new Date(data.issue_date) : undefined,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
          },
        },
        uploader: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
  }

  /**
   * Get all documents with filters
   */
  async getDocuments(filters: {
    userId?: string;
    documentType?: string;
    isVerified?: boolean;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.documentType) {
      where.document_type = filters.documentType as DocumentType;
    }

    if (filters.isVerified !== undefined) {
      where.is_verified = filters.isVerified;
    }

    return this.prisma.employeeDocument.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
        uploader: {
          select: {
            id: true,
            full_name: true,
          },
        },
        verifier: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string) {
    const document = await this.prisma.employeeDocument.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            employee_profile: true,
          },
        },
        uploader: {
          select: {
            id: true,
            full_name: true,
          },
        },
        verifier: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Verify document
   */
  async verifyDocument(id: string, verifiedBy: string, notes?: string) {
    return this.prisma.employeeDocument.update({
      where: { id: BigInt(id) },
      data: {
        is_verified: true,
        verified_by: BigInt(verifiedBy),
        verified_at: new Date(),
        notes: notes,
      },
      include: {
        user: true,
        verifier: true,
      },
    });
  }

  /**
   * Update document
   */
  async updateDocument(
    id: string,
    data: {
      document_name?: string;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
    },
  ) {
    const updateData: any = { ...data };

    if (data.issue_date) {
      updateData.issue_date = new Date(data.issue_date);
    }

    if (data.expiry_date) {
      updateData.expiry_date = new Date(data.expiry_date);
    }

    return this.prisma.employeeDocument.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string) {
    await this.prisma.employeeDocument.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Document deleted successfully' };
  }

  /**
   * Get expiring documents
   */
  async getExpiringDocuments(daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.employeeDocument.findMany({
      where: {
        expiry_date: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { expiry_date: 'asc' },
    });
  }

  /**
   * Get expired documents
   */
  async getExpiredDocuments() {
    return this.prisma.employeeDocument.findMany({
      where: {
        expiry_date: {
          lt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { expiry_date: 'desc' },
    });
  }

  /**
   * Get document statistics
   */
  async getDocumentStats() {
    const [total, verified, expiringSoon, expired, byType] = await Promise.all([
      this.prisma.employeeDocument.count(),
      this.prisma.employeeDocument.count({ where: { is_verified: true } }),
      this.prisma.employeeDocument.count({
        where: {
          expiry_date: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
      this.prisma.employeeDocument.count({
        where: {
          expiry_date: {
            lt: new Date(),
          },
        },
      }),
      this.prisma.employeeDocument.groupBy({
        by: ['document_type'],
        _count: true,
      }),
    ]);

    return {
      total,
      verified,
      unverified: total - verified,
      expiringSoon,
      expired,
      byType: byType.map((item) => ({
        type: item.document_type,
        count: item._count,
      })),
    };
  }
}
