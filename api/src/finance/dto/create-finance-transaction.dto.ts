import { IsString, IsNumber, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
  SALES = 'SALES',
  SUPPLIER_PAYMENT = 'SUPPLIER_PAYMENT',
  SALARY = 'SALARY',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  MAINTENANCE = 'MAINTENANCE',
  EQUIPMENT = 'EQUIPMENT',
  MARKETING = 'MARKETING',
  WASTE_LOSS = 'WASTE_LOSS',
  DELIVERY = 'DELIVERY',
  OTHER = 'OTHER',
}

export class CreateFinanceTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsEnum(TransactionCategory)
  @IsNotEmpty()
  category: TransactionCategory;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsNotEmpty()
  recorded_by: string;

  @IsDateString()
  @IsOptional()
  transaction_date?: string;
}
