import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum WasteReason {
  EXPIRED = 'EXPIRED',
  SPOILED = 'SPOILED',
  OVERPRODUCTION = 'OVERPRODUCTION',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  CUSTOMER_RETURN = 'CUSTOMER_RETURN',
  THEFT = 'THEFT',
  OTHER = 'OTHER',
}

export class CreateWasteDeclarationDto {
  @IsNotEmpty()
  product_id: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsEnum(WasteReason)
  @IsNotEmpty()
  reason: WasteReason;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNotEmpty()
  declared_by: string;
}
