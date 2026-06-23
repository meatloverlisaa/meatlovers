import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceTransactionDto, TransactionType, TransactionCategory } from './dto/create-finance-transaction.dto';
import { UpdateFinanceTransactionDto } from './dto/update-finance-transaction.dto';

@Controller('finance-transactions')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  createFinanceTransaction(@Body() createFinanceTransactionDto: CreateFinanceTransactionDto) {
    return this.financeService.createFinanceTransaction(createFinanceTransactionDto);
  }

  @Get()
  findAllFinanceTransactions(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('recordedBy') recordedBy?: string,
  ) {
    return this.financeService.findAllFinanceTransactions(
      type as TransactionType,
      category as TransactionCategory,
      startDate,
      endDate,
      recordedBy,
    );
  }

  @Get('summary')
  getFinanceSummary(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getFinanceSummary(
      type as TransactionType,
      category as TransactionCategory,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOneFinanceTransaction(@Param('id') id: string) {
    return this.financeService.findOneFinanceTransaction(id);
  }

  @Patch(':id')
  updateFinanceTransaction(@Param('id') id: string, @Body() updateFinanceTransactionDto: UpdateFinanceTransactionDto) {
    return this.financeService.updateFinanceTransaction(id, updateFinanceTransactionDto);
  }

  @Delete(':id')
  removeFinanceTransaction(@Param('id') id: string) {
    return this.financeService.removeFinanceTransaction(id);
  }
}
