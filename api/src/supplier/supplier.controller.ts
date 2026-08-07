/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-argument */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  SUPPLIER_READ_ROLES,
  SUPPLIER_WRITE_ROLES,
} from '../auth/constants/role-groups';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard, Permission } from '../auth/guards/permission.guard';
import { Resource, Action } from '../auth/constants/role-permissions';

/**
 * SupplierController
 *
 * Manages supplier relationships with fine-grained permission control.
 *
 * Permissions:
 * - READ: SUPER_ADMIN, ADMIN, MANAGER, STOREKEEPER, ACCOUNTANT
 * - CREATE: SUPER_ADMIN, ADMIN
 * - UPDATE: SUPER_ADMIN, ADMIN
 * - DELETE: SUPER_ADMIN, ADMIN
 *
 * Note: Supplier data includes financial information and must be protected.
 */
@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @Roles(...SUPPLIER_READ_ROLES)
  @Permission(Resource.SUPPLIERS, Action.READ)
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @Roles(...SUPPLIER_READ_ROLES)
  @Permission(Resource.SUPPLIERS, Action.READ)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Post()
  @Roles(...SUPPLIER_WRITE_ROLES)
  @Permission(Resource.SUPPLIERS, Action.CREATE)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Patch(':id')
  @Roles(...SUPPLIER_WRITE_ROLES)
  @Permission(Resource.SUPPLIERS, Action.UPDATE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Patch(':id/status')
  @Roles(...SUPPLIER_WRITE_ROLES)
  @Permission(Resource.SUPPLIERS, Action.UPDATE)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: any,
  ) {
    return this.supplierService.updateStatus(
      id,
      updateStatusDto?.status || 'ACTIVE',
    );
  }

  @Delete(':id')
  @Roles(...SUPPLIER_WRITE_ROLES)
  @Permission(Resource.SUPPLIERS, Action.DELETE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
