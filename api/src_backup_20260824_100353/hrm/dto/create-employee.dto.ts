import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export enum EmploymentType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  PART_TIME = 'PART_TIME',
  CASUAL = 'CASUAL',
  PROBATION = 'PROBATION',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export class CreateEmployeeDto {
  // User Basic Information
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  full_name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role;

  // Personal Details
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  // Identification
  @IsString()
  @IsOptional()
  national_id?: string;

  @IsString()
  @IsOptional()
  tax_id?: string;

  @IsString()
  @IsOptional()
  passport_number?: string;

  // Contact Information
  @IsString()
  @IsOptional()
  alternative_phone?: string;

  @IsEmail()
  @IsOptional()
  personal_email?: string;

  @IsString()
  @IsOptional()
  physical_address?: string;

  @IsString()
  @IsOptional()
  postal_address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  // Emergency Contact
  @IsString()
  @IsOptional()
  emergency_contact_name?: string;

  @IsString()
  @IsOptional()
  emergency_contact_phone?: string;

  @IsString()
  @IsOptional()
  emergency_contact_relationship?: string;

  // Employment Details
  @IsDateString()
  employment_start_date: string;

  @IsDateString()
  @IsOptional()
  employment_end_date?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employment_type?: EmploymentType;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  employment_status?: EmploymentStatus;

  @IsDateString()
  @IsOptional()
  probation_end_date?: string;

  @IsDateString()
  @IsOptional()
  contract_end_date?: string;

  // Department & Position
  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position_title?: string;

  @IsString()
  @IsOptional()
  reports_to_user_id?: string;

  // Banking Details
  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsString()
  @IsOptional()
  bank_account_number?: string;

  @IsString()
  @IsOptional()
  bank_account_name?: string;

  @IsString()
  @IsOptional()
  bank_branch?: string;

  @IsString()
  @IsOptional()
  bank_swift_code?: string;

  // Qualifications
  @IsString()
  @IsOptional()
  education_level?: string;

  @IsString()
  @IsOptional()
  certifications?: string;

  @IsString()
  @IsOptional()
  skills?: string;

  // Additional Information
  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  profile_photo_url?: string;
}
