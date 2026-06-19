import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SupplierStatus } from '@prisma/client';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsEnum(SupplierStatus)
  @IsOptional()
  status?: SupplierStatus;
}
