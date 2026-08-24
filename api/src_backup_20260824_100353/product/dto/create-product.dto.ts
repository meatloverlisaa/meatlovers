import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name!: string;

  @IsEnum(ProductCategory)
  @IsNotEmpty()
  product_category!: ProductCategory;

  // Prisma uses Decimal; in JSON this arrives as string or number.
  @IsDecimal()
  selling_price!: string;

  @IsDecimal()
  cost_price!: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
