import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  CreateFinanceTransactionDto,
  TransactionType,
  TransactionCategory,
} from './dto/create-finance-transaction.dto';
import { UpdateFinanceTransactionDto } from './dto/update-finance-transaction.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { FINANCE_ROLES } from '../auth/constants/role-groups';

@Controller('finance-transactions')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  @Roles(...FINANCE_ROLES)
  createFinanceTransaction(
    @Body() createFinanceTransactionDto: CreateFinanceTransactionDto,
  ) {
    return this.financeService.createFinanceTransaction(
      createFinanceTransactionDto,
    );
  }

  @Get()
  @Roles(...FINANCE_ROLES)
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
  @Roles(...FINANCE_ROLES)
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
  @Roles(...FINANCE_ROLES)
  findOneFinanceTransaction(@Param('id') id: string) {
    return this.financeService.findOneFinanceTransaction(id);
  }

  @Patch(':id')
  @Roles(...FINANCE_ROLES)
  updateFinanceTransaction(
    @Param('id') id: string,
    @Body() updateFinanceTransactionDto: UpdateFinanceTransactionDto,
  ) {
    return this.financeService.updateFinanceTransaction(
      id,
      updateFinanceTransactionDto,
    );
  }

  @Delete(':id')
  @Roles(...FINANCE_ROLES)
  removeFinanceTransaction(@Param('id') id: string) {
    return this.financeService.removeFinanceTransaction(id);
  }
}
