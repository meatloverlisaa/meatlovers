import { IsEnum, IsNotEmpty } from 'class-validator';
import { SupplierStatus } from '@prisma/client';

export class UpdateSupplierStatusDto {
  @IsEnum(SupplierStatus)
  @IsNotEmpty()
  status: SupplierStatus;
}
