import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class ApplyDiscountDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  discountAmount?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
