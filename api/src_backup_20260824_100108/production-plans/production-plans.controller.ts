import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductionPlansService } from './production-plans.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from './dto/update-production-plan.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { KITCHEN_ROLES, MANAGEMENT_ROLES } from '../auth/constants/role-groups';

@Controller('production-plans')
export class ProductionPlansController {
  constructor(
    private readonly productionPlansService: ProductionPlansService,
  ) {}

  @Post()
  @Roles(...KITCHEN_ROLES)
  create(@Body() createProductionPlanDto: CreateProductionPlanDto) {
    return this.productionPlansService.create(createProductionPlanDto);
  }

  @Get()
  @Roles(...KITCHEN_ROLES, ...MANAGEMENT_ROLES)
  findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.findAll(status, startDate, endDate);
  }

  @Get('summary')
  @Roles(...KITCHEN_ROLES, ...MANAGEMENT_ROLES)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productionPlansService.getProductionSummary(startDate, endDate);
  }

  @Get(':id')
  @Roles(...KITCHEN_ROLES, ...MANAGEMENT_ROLES)
  findOne(@Param('id') id: string) {
    return this.productionPlansService.findOne(id);
  }

  @Get('recipe/:recipeId')
  @Roles(...KITCHEN_ROLES, ...MANAGEMENT_ROLES)
  findByRecipeId(@Param('recipeId') recipeId: string) {
    return this.productionPlansService.findByRecipeId(recipeId);
  }

  @Patch(':id')
  @Roles(...KITCHEN_ROLES)
  update(
    @Param('id') id: string,
    @Body() updateProductionPlanDto: UpdateProductionPlanDto,
  ) {
    return this.productionPlansService.update(id, updateProductionPlanDto);
  }

  @Patch(':id/produced-quantity')
  @Roles(...KITCHEN_ROLES)
  updateProducedQuantity(
    @Param('id') id: string,
    @Body('producedQuantity') producedQuantity: number,
  ) {
    return this.productionPlansService.updateProducedQuantity(
      id,
      producedQuantity,
    );
  }

  @Delete(':id')
  @Roles(...MANAGEMENT_ROLES)
  remove(@Param('id') id: string) {
    return this.productionPlansService.remove(id);
  }
}
