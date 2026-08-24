import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePayrollDto {
  @IsString()
  user_id: string;

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsNumber()
  @Min(0)
  basic_salary: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  allowances?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime_pay?: number;

  @IsNumber()
  @Min(0)
  net_salary: number;

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePayrollDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  basic_salary?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  allowances?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime_pay?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  net_salary?: number;

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcessBulkPayrollDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsOptional()
  calculate_overtime_from_attendance?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime_hourly_rate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  housing_allowance_percent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  transport_allowance_flat?: number;

  @IsOptional()
  apply_statutory_deductions?: boolean;
}

export class MarkPayrollPaidDto {
  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsString()
  payment_method: string;

  @IsString()
  @IsOptional()
  payment_reference?: string;
}

export class BulkPayPayrollDto {
  @IsString({ each: true })
  payroll_ids: string[];

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsString()
  payment_method: string;

  @IsString()
  @IsOptional()
  payment_reference?: string;
}
