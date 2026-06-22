import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  tableId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  waiterId?: number;
}

