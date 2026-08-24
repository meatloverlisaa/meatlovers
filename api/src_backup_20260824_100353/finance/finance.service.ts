/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFinanceTransactionDto,
  TransactionType,
  TransactionCategory,
} from './dto/create-finance-transaction.dto';
import { UpdateFinanceTransactionDto } from './dto/update-finance-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createFinanceTransaction(
    createFinanceTransactionDto: CreateFinanceTransactionDto,
  ) {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: BigInt(createFinanceTransactionDto.recorded_by) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate amount is positive
    if (createFinanceTransactionDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const transactionDate = createFinanceTransactionDto.transaction_date
      ? new Date(createFinanceTransactionDto.transaction_date)
      : new Date();

    const financeTransaction = await this.prisma.financeTransaction.create({
      data: {
        type: createFinanceTransactionDto.type,
        category: createFinanceTransactionDto.category,
        amount: createFinanceTransactionDto.amount,
        description: createFinanceTransactionDto.description,
        reference: createFinanceTransactionDto.reference,
        recorded_by: BigInt(createFinanceTransactionDto.recorded_by),
        transaction_date: transactionDate,
      },
      include: {
        recorder: true,
      },
    });

    return financeTransaction;
  }

  async findAllFinanceTransactions(
    type?: TransactionType,
    category?: TransactionCategory,
    startDate?: string,
    endDate?: string,
    recordedBy?: string,
  ) {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (recordedBy) {
      where.recorded_by = BigInt(recordedBy);
    }

    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) {
        where.transaction_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.transaction_date.lte = new Date(endDate);
      }
    }

    return this.prisma.financeTransaction.findMany({
      where,
      include: {
        recorder: true,
      },
      orderBy: {
        transaction_date: 'desc',
      },
    });
  }

  async findOneFinanceTransaction(id: string) {
    const financeTransaction = await this.prisma.financeTransaction.findUnique({
      where: { id: BigInt(id) },
      include: {
        recorder: true,
      },
    });

    if (!financeTransaction) {
      throw new NotFoundException('Finance transaction not found');
    }

    return financeTransaction;
  }

  async updateFinanceTransaction(
    id: string,
    updateFinanceTransactionDto: UpdateFinanceTransactionDto,
  ) {
    const financeTransaction = await this.prisma.financeTransaction.findUnique({
      where: { id: BigInt(id) },
    });

    if (!financeTransaction) {
      throw new NotFoundException('Finance transaction not found');
    }

    // Validate amount if provided
    if (
      updateFinanceTransactionDto.amount !== undefined &&
      updateFinanceTransactionDto.amount <= 0
    ) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Validate user if provided
    if (updateFinanceTransactionDto.recorded_by !== undefined) {
      const user = await this.prisma.users.findUnique({
        where: { id: BigInt(updateFinanceTransactionDto.recorded_by) },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const updatedTransaction = await this.prisma.financeTransaction.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateFinanceTransactionDto.type !== undefined && {
          type: updateFinanceTransactionDto.type,
        }),
        ...(updateFinanceTransactionDto.category !== undefined && {
          category: updateFinanceTransactionDto.category,
        }),
        ...(updateFinanceTransactionDto.amount !== undefined && {
          amount: updateFinanceTransactionDto.amount,
        }),
        ...(updateFinanceTransactionDto.description !== undefined && {
          description: updateFinanceTransactionDto.description,
        }),
        ...(updateFinanceTransactionDto.reference !== undefined && {
          reference: updateFinanceTransactionDto.reference,
        }),
        ...(updateFinanceTransactionDto.recorded_by !== undefined && {
          recorded_by: BigInt(updateFinanceTransactionDto.recorded_by),
        }),
        ...(updateFinanceTransactionDto.transaction_date !== undefined && {
          transaction_date: new Date(
            updateFinanceTransactionDto.transaction_date,
          ),
        }),
      },
      include: {
        recorder: true,
      },
    });

    return updatedTransaction;
  }

  async removeFinanceTransaction(id: string) {
    const financeTransaction = await this.prisma.financeTransaction.findUnique({
      where: { id: BigInt(id) },
    });

    if (!financeTransaction) {
      throw new NotFoundException('Finance transaction not found');
    }

    await this.prisma.financeTransaction.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Finance transaction deleted successfully' };
  }

  async getFinanceSummary(
    type?: TransactionType,
    category?: TransactionCategory,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) {
        where.transaction_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.transaction_date.lte = new Date(endDate);
      }
    }

    const transactions = await this.prisma.financeTransaction.findMany({
      where,
      include: {
        recorder: true,
      },
    });

    const summary = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byRecorder: {} as Record<string, number>,
      transactions,
    };

    transactions.forEach((t) => {
      const amount = Number(t.amount);

      if (t.type === 'INCOME') {
        summary.totalIncome += amount;
      } else {
        summary.totalExpenses += amount;
      }

      // Group by type
      summary.byType[t.type] = (summary.byType[t.type] || 0) + amount;

      // Group by category
      summary.byCategory[t.category] =
        (summary.byCategory[t.category] || 0) + amount;

      // Group by recorder
      const recorderName = t.recorder?.full_name || 'Unknown';
      summary.byRecorder[recorderName] =
        (summary.byRecorder[recorderName] || 0) + amount;
    });

    summary.netProfit = summary.totalIncome - summary.totalExpenses;

    return summary;
  }
}
