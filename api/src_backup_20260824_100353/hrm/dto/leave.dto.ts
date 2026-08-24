import {
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { LeaveType } from '@prisma/client';

export class CreateLeaveRequestDto {
  @IsString()
  user_id: string;

  @IsEnum(LeaveType)
  leave_type: LeaveType;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsInt()
  @Min(1)
  days_count: number;

  @IsString()
  reason: string;
}

export class ApproveLeaveDto {
  @IsString()
  approved_by: string;
}

export class RejectLeaveDto {
  @IsString()
  approved_by: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
