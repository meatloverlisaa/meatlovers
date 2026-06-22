import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDeliveryDto {
  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  rider_id: string;

  @IsString()
  @IsOptional()
  pickup_address?: string;

  @IsString()
  @IsNotEmpty()
  delivery_address: string;

  @IsString()
  @IsOptional()
  delivery_notes?: string;
}
