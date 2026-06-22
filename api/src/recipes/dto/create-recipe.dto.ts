import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeIngredientDto {
  @IsDecimal()
  quantity: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  stock_item_id: string;
}

export class CreateRecipeDto {
  @IsString()
  product_id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];
}
