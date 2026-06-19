import { IsBoolean, IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PricingRuleType, ProductCategory } from '@prisma/client';

export class CreatePricingRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(PricingRuleType)
  rule_type!: PricingRuleType;

  // Decimal comes as string/number in JSON.
  @IsDecimal()
  value!: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  product_category?: ProductCategory | null;

  @IsOptional()
  @IsDecimal()
  min_selling_price?: string | null;

  @IsOptional()
  @IsDecimal()
  max_selling_price?: string | null;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

