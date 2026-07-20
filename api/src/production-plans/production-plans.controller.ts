import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductionPlansService } from './production-plans.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from './dto/update-production-plan.dto';
import { Public } from '../auth/public.decorator';

@Controller('production-plans')
export class ProductionPlansController {
  constructor(private readonly productionPlansService: ProductionPlansService) {}

  @Post()
  @Public()
  create(@Body() createProductionPlanDto: CreateProductionPlanDto) {
    return this.productionPlansService.create(createProductionPlanDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.findAll(status, startDate, endDate);
  }

  @Get('summary')
  @Public()
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.getProductionSummary(startDate, endDate);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.productionPlansService.findOne(id);
  }

  @Get('recipe/:recipeId')
  @Public()
  findByRecipeId(@Param('recipeId') recipeId: string) {
    return this.productionPlansService.findByRecipeId(recipeId);
  }

  @Patch(':id')
  @Public()
  update(@Param('id') id: string, @Body() updateProductionPlanDto: UpdateProductionPlanDto) {
    return this.productionPlansService.update(id, updateProductionPlanDto);
  }

  @Patch(':id/produced-quantity')
  @Public()
  updateProducedQuantity(@Param('id') id: string, @Body('producedQuantity') producedQuantity: number) {
    return this.productionPlansService.updateProducedQuantity(id, producedQuantity);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: string) {
    return this.productionPlansService.remove(id);
  }
}
