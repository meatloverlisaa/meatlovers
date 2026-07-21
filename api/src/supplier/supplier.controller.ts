import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  SUPPLIER_READ_ROLES,
  SUPPLIER_WRITE_ROLES,
} from '../auth/constants/role-groups';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @Roles(...SUPPLIER_READ_ROLES)
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @Roles(...SUPPLIER_READ_ROLES)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Post()
  @Roles(...SUPPLIER_WRITE_ROLES)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Patch(':id')
  @Roles(...SUPPLIER_WRITE_ROLES)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Patch(':id/status')
  @Roles(...SUPPLIER_WRITE_ROLES)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateStatusDto: any) {
    return this.supplierService.updateStatus(id, updateStatusDto?.status || 'ACTIVE');
  }

  @Delete(':id')
  @Roles(...SUPPLIER_WRITE_ROLES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
