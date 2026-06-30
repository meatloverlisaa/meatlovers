import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { AddPreparationNoteDto } from './dto/add-preparation-note.dto';
import { LogIngredientConsumptionDto } from './dto/log-ingredient-consumption.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('kitchen')
@UseGuards(JwtAuthGuard)
@Roles(Role.CHEF, Role.ADMIN, Role.MANAGER)
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('queue')
  getKitchenQueue(@Query('status') status?: string) {
    return this.kitchenService.getKitchenQueue(status);
  }

  @Get('queue/:id')
  getOrderById(@Param('id') id: string) {
    return this.kitchenService.getOrderById(id);
  }

  @Patch('queue/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.kitchenService.updateOrderStatus({ id, ...updateDto });
  }

  @Get('summary')
  getKitchenSummary() {
    return this.kitchenService.getKitchenSummary();
  }

  @Get('metrics')
  getKitchenMetrics() {
    return this.kitchenService.getKitchenMetrics();
  }

  @Get('delayed')
  getDelayedOrders() {
    return this.kitchenService.getDelayedOrders();
  }

  @Get('activity')
  getKitchenActivity(@Query('limit') limit?: string) {
    return this.kitchenService.getKitchenActivity(limit ? parseInt(limit) : 20);
  }

  @Post('orders/:id/notes')
  addPreparationNote(
    @Param('id') id: string,
    @Body() dto: AddPreparationNoteDto,
  ) {
    return this.kitchenService.addPreparationNote(id, dto);
  }

  @Post('ingredient-consumption')
  logIngredientConsumption(@Body() dto: LogIngredientConsumptionDto) {
    return this.kitchenService.logIngredientConsumption(dto);
  }
}
