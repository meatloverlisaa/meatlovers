import {
  IsArray,
  IsInt,
  IsPositive,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @Min(1)
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreatePosOrderDto {
  @IsNumber()
  @Min(1)
  tableId!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  customerId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
