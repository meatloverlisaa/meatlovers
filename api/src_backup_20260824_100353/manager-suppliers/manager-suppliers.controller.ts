import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ManagerSuppliersService } from './manager-suppliers.service';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../supplier/dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from '../supplier/dto/update-supplier-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, SupplierType, SupplierStatus } from '@prisma/client';

/**
 * Manager Suppliers Routes — Full supplier management for MANAGER role
 * MANAGER can view, create, edit, and manage all supplier relationships
 */
@Controller('manager/suppliers')
@UseGuards(JwtAuthGuard)
@Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
export class ManagerSuppliersController {
  constructor(
    private readonly managerSuppliersService: ManagerSuppliersService,
  ) {}

  /**
   * GET /manager/suppliers
   * View all suppliers with optional filters
   * Query: ?type=FOOD&status=ACTIVE
   */
  @Get()
  findAll(
    @Query('type') type?: SupplierType,
    @Query('status') status?: SupplierStatus,
  ) {
    return this.managerSuppliersService.findAll(type, status);
  }

  /**
   * GET /manager/suppliers/stats
   * Get supplier statistics overview
   */
  @Get('stats')
  getStats() {
    return this.managerSuppliersService.getStats();
  }

  /**
   * GET /manager/suppliers/recent
   * Get recently added suppliers
   * Query: ?limit=10
   */
  @Get('recent')
  getRecent(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.managerSuppliersService.getRecent(limitNum);
  }

  /**
   * GET /manager/suppliers/active
   * Get all active suppliers
   */
  @Get('active')
  getActive() {
    return this.managerSuppliersService.getActive();
  }

  /**
   * GET /manager/suppliers/search
   * Search suppliers by name, contact, email, or phone
   * Query: ?q=search_term
   */
  @Get('search')
  search(@Query('q') query: string) {
    return this.managerSuppliersService.search(query);
  }

  /**
   * GET /manager/suppliers/type/:type
   * Get suppliers by type (FOOD, SOFT_DRINKS, ALCOHOL, GENERAL)
   */
  @Get('type/:type')
  getByType(@Param('type') type: SupplierType) {
    return this.managerSuppliersService.getByType(type);
  }

  /**
   * GET /manager/suppliers/:id
   * View detailed supplier information
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.managerSuppliersService.findOne(id);
  }

  /**
   * POST /manager/suppliers
   * Create a new supplier
   */
  @Post()
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.managerSuppliersService.create(createSupplierDto);
  }

  /**
   * PATCH /manager/suppliers/:id
   * Update supplier details
   */
  @Patch(':id')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.managerSuppliersService.update(id, updateSupplierDto);
  }

  /**
   * PATCH /manager/suppliers/:id/status
   * Update supplier status (ACTIVE/SUSPENDED)
   */
  @Patch(':id/status')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateSupplierStatusDto,
  ) {
    return this.managerSuppliersService.updateStatus(
      id,
      updateStatusDto.status,
    );
  }

  /**
   * DELETE /manager/suppliers/:id
   * Delete/remove a supplier
   */
  @Delete(':id')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.managerSuppliersService.remove(id);
  }
}
