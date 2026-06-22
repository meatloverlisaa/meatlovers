import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  cancellation_reason?: string;
}
