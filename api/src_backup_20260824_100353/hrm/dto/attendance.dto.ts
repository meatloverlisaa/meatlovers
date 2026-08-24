import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @IsString()
  user_id: string;

  @IsDateString()
  date: string;

  @IsDateString()
  @IsOptional()
  check_in?: string;

  @IsDateString()
  @IsOptional()
  check_out?: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsNumber()
  @Min(0)
  @Max(24)
  @IsOptional()
  hours_worked?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAttendanceDto {
  @IsDateString()
  @IsOptional()
  check_in?: string;

  @IsDateString()
  @IsOptional()
  check_out?: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsNumber()
  @Min(0)
  @Max(24)
  @IsOptional()
  hours_worked?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
