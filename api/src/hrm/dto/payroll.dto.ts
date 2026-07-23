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
