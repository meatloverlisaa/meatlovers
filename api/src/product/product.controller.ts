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

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles(...PRODUCT_READ_ROLES)
  findAll(@Query('category') category?: string, @Query('status') status?: string) {
    if (category) {
      return this.productService.findByCategory(category, status);
    }
    return this.productService.findAll(status);
  }

  @Get(':id')
  @Roles(...PRODUCT_READ_ROLES)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  @Roles(...PRODUCT_WRITE_ROLES)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  @Roles(...PRODUCT_WRITE_ROLES)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Req() request: Request) {
    return this.productService.update(id, updateProductDto, request);
  }

  @Patch(':id/price')
  @Roles(...FINANCE_ROLES)
  updatePrice(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Req() request?: Request) {
    return this.productService.update(id, updateProductDto, request);
  }

  @Delete(':id')
  @Roles(...PRODUCT_WRITE_ROLES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}

