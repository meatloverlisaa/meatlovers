import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryDto } from './create-delivery.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  cancellation_reason?: string;
}
