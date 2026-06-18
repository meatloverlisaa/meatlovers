import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MarginAlertStatus } from '@prisma/client';

export class UpdateMarginAlertDto {
  @IsEnum(MarginAlertStatus)
  alert_status!: MarginAlertStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;
}

