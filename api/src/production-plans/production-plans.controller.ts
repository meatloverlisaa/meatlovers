import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductionPlansService } from './production-plans.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from './dto/update-production-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('production-plans')
@UseGuards(JwtAuthGuard)
export class ProductionPlansController {
  constructor(private readonly productionPlansService: ProductionPlansService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createProductionPlanDto: CreateProductionPlanDto) {
    return this.productionPlansService.create(createProductionPlanDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.findAll(status, startDate, endDate);
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.MANAGER)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.getProductionSummary(startDate, endDate);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.productionPlansService.findOne(id);
  }

  @Get('recipe/:recipeId')
  @Roles(Role.ADMIN, Role.MANAGER)
  findByRecipeId(@Param('recipeId') recipeId: string) {
    return this.productionPlansService.findByRecipeId(recipeId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductionPlanDto: UpdateProductionPlanDto) {
    return this.productionPlansService.update(id, updateProductionPlanDto);
  }

  @Patch(':id/produced-quantity')
  @Roles(Role.ADMIN)
  updateProducedQuantity(@Param('id') id: string, @Body('producedQuantity') producedQuantity: number) {
    return this.productionPlansService.updateProducedQuantity(id, producedQuantity);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productionPlansService.remove(id);
  }
}
