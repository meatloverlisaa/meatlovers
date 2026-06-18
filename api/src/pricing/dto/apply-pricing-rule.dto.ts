import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApplyPricingRuleDto {
  @IsNotEmpty()
  productId!: number;

  // In a real system this would come from auth (JWT), but for now request it.
  @IsNotEmpty()
  actorUserId!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

