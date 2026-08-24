import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateProductionPlanDto {
  @IsString()
  recipe_id: string;

  @IsInt()
  planned_quantity: number;

  @IsDateString()
  planned_date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
