import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { CreateProductionPlanDto } from './create-production-plan.dto';

export class UpdateProductionPlanDto extends PartialType(CreateProductionPlanDto) {
  @IsInt()
  @IsOptional()
  produced_quantity?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
