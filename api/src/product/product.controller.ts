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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  FINANCE_ROLES,
  PRODUCT_READ_ROLES,
  PRODUCT_WRITE_ROLES,
} from '../auth/constants/role-groups';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard, Permission } from '../auth/guards/permission.guard';
import { Resource, Action } from '../auth/constants/role-permissions';

/**
 * ProductController
 * 
 * Manages product catalog operations with fine-grained permission control.
 * 
 * Permissions:
 * - READ: SUPER_ADMIN, ADMIN, MANAGER, STOREKEEPER, WAITER, CHEF, BARMAN
 * - CREATE: SUPER_ADMIN, ADMIN
 * - UPDATE: SUPER_ADMIN, ADMIN
 * - DELETE: SUPER_ADMIN, ADMIN
 * 
 * Special:
 * - Price updates require PRICING permission (SUPER_ADMIN, ADMIN only)
 */
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles(...PRODUCT_READ_ROLES)
  @Permission(Resource.PRODUCTS, Action.READ)
  findAll(@Query('category') category?: string, @Query('status') status?: string) {
    if (category) {
      return this.productService.findByCategory(category, status);
    }
    return this.productService.findAll(status);
  }

  @Get(':id')
  @Roles(...PRODUCT_READ_ROLES)
  @Permission(Resource.PRODUCTS, Action.READ)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  @Roles(...PRODUCT_WRITE_ROLES)
  @Permission(Resource.PRODUCTS, Action.CREATE)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  @Roles(...PRODUCT_WRITE_ROLES)
  @Permission(Resource.PRODUCTS, Action.UPDATE)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Req() request: Request) {
    return this.productService.update(id, updateProductDto, request);
  }

  @Patch(':id/price')
  @Roles(...FINANCE_ROLES)
  @Permission(Resource.PRICING, Action.UPDATE)
  updatePrice(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Req() request?: Request) {
    return this.productService.update(id, updateProductDto, request);
  }

  @Delete(':id')
  @Roles(...PRODUCT_WRITE_ROLES)
  @Permission(Resource.PRODUCTS, Action.DELETE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}

