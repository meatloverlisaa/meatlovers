import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryDto } from './create-delivery.dto';
import { IsString, IsOptional, IsInt, IsDateString, IsNumber } from 'class-validator';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  cancellation_reason?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsDateString()
  estimated_delivery_at?: string;

  @IsOptional()
  @IsString()
  delay_reason?: string;

  @IsOptional()
  @IsNumber()
  distance_km?: number;
}
