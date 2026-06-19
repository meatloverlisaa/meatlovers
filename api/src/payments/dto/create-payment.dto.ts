import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CASH = 'CASH',
  MPESA = 'MPESA',
  CARD = 'CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

class PaymentItemDto {
  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  transaction_reference?: string;
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  order_id!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments!: PaymentItemDto[];
}
