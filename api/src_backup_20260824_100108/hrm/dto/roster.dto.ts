import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ShiftType } from '@prisma/client';

export class CreateRosterDto {
  @IsString()
  user_id: string;

  @IsDateString()
  shift_date: string;

  @IsEnum(ShiftType)
  shift_type: ShiftType;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'start_time must be in HH:MM format',
  })
  start_time: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'end_time must be in HH:MM format',
  })
  end_time: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateRosterDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsDateString()
  @IsOptional()
  shift_date?: string;

  @IsEnum(ShiftType)
  @IsOptional()
  shift_type?: ShiftType;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'start_time must be in HH:MM format',
  })
  @IsOptional()
  start_time?: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'end_time must be in HH:MM format',
  })
  @IsOptional()
  end_time?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
