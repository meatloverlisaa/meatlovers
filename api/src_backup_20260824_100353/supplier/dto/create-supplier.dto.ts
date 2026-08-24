import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SupplierType } from '@prisma/client';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  supplier_name: string;

  @IsString()
  @IsOptional()
  contact_person?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  physical_address?: string;

  @IsEnum(SupplierType)
  @IsNotEmpty()
  supplier_type: SupplierType;
}
