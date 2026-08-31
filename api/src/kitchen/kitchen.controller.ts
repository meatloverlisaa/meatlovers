import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { AddPreparationNoteDto } from './dto/add-preparation-note.dto';
import { LogIngredientConsumptionDto } from './dto/log-ingredient-consumption.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { KITCHEN_ROLES, MANAGEMENT_ROLES } from '../auth/constants/role-groups';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('queue')
  @Roles(...KITCHEN_ROLES)
  getKitchenQueue(@Query('status') status?: string) {
    return this.kitchenService.getKitchenQueue(status);
  }

  @Get('queue/:id')
  @Roles(...KITCHEN_ROLES)
  getOrderById(@Param('id') id: string) {
    return this.kitchenService.getOrderById(id);
  }

  @Get('orders/:id/status')
  @Roles(...KITCHEN_ROLES)
  getOrderStatus(@Param('id') id: string) {
    return this.kitchenService.getOrderById(id);
  }

  @Get('queue/:id/check-ingredients')
  @Roles(...KITCHEN_ROLES)
  checkOrderIngredientsAvailable(@Param('id') id: string) {
    return this.kitchenService.checkOrderIngredientsAvailable(id);
  }

  @Patch('queue/:id/status')
  @Roles(...KITCHEN_ROLES)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.kitchenService.updateOrderStatus({ id, ...updateDto });
  }

  @Get('summary')
  @Roles(...KITCHEN_ROLES)
  getKitchenSummary() {
    return this.kitchenService.getKitchenSummary();
  }

  @Get('metrics')
  @Roles(...MANAGEMENT_ROLES)
  getKitchenMetrics() {
    return this.kitchenService.getKitchenMetrics();
  }

  @Get('delayed')
  @Roles(...MANAGEMENT_ROLES)
  getDelayedOrders() {
    return this.kitchenService.getDelayedOrders();
  }

  @Get('activity')
  @Roles(...KITCHEN_ROLES)
  getKitchenActivity(@Query('limit') limit?: string) {
    return this.kitchenService.getKitchenActivity(limit ? parseInt(limit) : 20);
  }

  @Post('orders/:id/notes')
  @Roles(...KITCHEN_ROLES)
  addPreparationNote(
    @Param('id') id: string,
    @Body() dto: AddPreparationNoteDto,
  ) {
    return this.kitchenService.addPreparationNote(id, dto);
  }

  @Post('ingredient-consumption')
  @Roles(...KITCHEN_ROLES)
  logIngredientConsumption(@Body() dto: LogIngredientConsumptionDto) {
    return this.kitchenService.logIngredientConsumption(dto);
  }
}
