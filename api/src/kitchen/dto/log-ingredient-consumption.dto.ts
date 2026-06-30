import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ConsumptionSource {
  PRODUCTION = 'PRODUCTION',
  ORDER = 'ORDER',
}

export class LogIngredientConsumptionDto {
  @IsNumber()
  @IsNotEmpty()
  stock_item_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ConsumptionSource)
  source: ConsumptionSource;

  @IsString()
  @IsOptional()
  reference_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
