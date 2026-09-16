import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  delivery_latitude?: number;

  @IsNumber()
  @IsOptional()
  delivery_longitude?: number;

  @IsString()
  @IsOptional()
  delivery_notes?: string;
}
