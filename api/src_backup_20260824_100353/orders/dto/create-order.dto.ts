import {
  IsArray,
  IsInt,
  IsPositive,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  // Incoming JSON will be plain numbers; service will coerce to BigInt when talking to Prisma
  @IsNumber()
  @Min(1)
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  tableId!: number;

  @IsNumber()
  @Min(1)
  waiterId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
