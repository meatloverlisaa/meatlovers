import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class GetOrdersQueryDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  tableId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  waiterId?: number;
}

