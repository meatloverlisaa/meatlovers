import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from './dto/update-supplier-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '@prisma/client';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER, Role.ACCOUNTANT)
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER, Role.ACCOUNTANT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateStatusDto: UpdateSupplierStatusDto) {
    return this.supplierService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
