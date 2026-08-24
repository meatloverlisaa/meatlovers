import { IsNumber, IsInt, IsPositive, Min } from 'class-validator';

export class AddOrderItemDto {
  @IsNumber()
  @Min(1)
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
