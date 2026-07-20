import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductionPlansService } from './production-plans.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from './dto/update-production-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('production-plans')
export class ProductionPlansController {
  constructor(private readonly productionPlansService: ProductionPlansService) {}

  @Post()
  create(@Body() createProductionPlanDto: CreateProductionPlanDto) {
    return this.productionPlansService.create(createProductionPlanDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.findAll(status, startDate, endDate);
  }

  @Get('summary')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.getProductionSummary(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionPlansService.findOne(id);
  }

  @Get('recipe/:recipeId')
  findByRecipeId(@Param('recipeId') recipeId: string) {
    return this.productionPlansService.findByRecipeId(recipeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductionPlanDto: UpdateProductionPlanDto) {
    return this.productionPlansService.update(id, updateProductionPlanDto);
  }

  @Patch(':id/produced-quantity')
  updateProducedQuantity(@Param('id') id: string, @Body('producedQuantity') producedQuantity: number) {
    return this.productionPlansService.updateProducedQuantity(id, producedQuantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionPlansService.remove(id);
  }
}
