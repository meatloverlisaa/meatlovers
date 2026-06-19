import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsString()
  @IsOptional()
  product_name?: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  product_category?: ProductCategory;

  @IsDecimal()
  @IsOptional()
  selling_price?: string;

  @IsDecimal()
  @IsOptional()
  cost_price?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

