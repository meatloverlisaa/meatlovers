import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRiderDto {
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  license_number?: string;

  @IsString()
  @IsOptional()
  vehicle_type?: string;

  @IsString()
  @IsOptional()
  vehicle_plate?: string;

  @IsString()
  @IsOptional()
  current_location?: string;
}
