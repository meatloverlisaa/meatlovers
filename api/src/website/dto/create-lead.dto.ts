import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
} from 'class-validator';
import { LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsOptional()
  @IsString()
  enquiry_type?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  event_date?: string;

  @IsOptional()
  @IsInt()
  guest_count?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
