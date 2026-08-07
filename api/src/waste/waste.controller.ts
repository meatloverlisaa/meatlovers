/* eslint-disable */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WasteService } from './waste.service';
import { CreateWasteDeclarationDto } from './dto/create-waste-declaration.dto';
import { UpdateWasteDeclarationDto } from './dto/update-waste-declaration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('waste-declarations')
export class WasteController {
  constructor(private readonly wasteService: WasteService) {}

  @Post()
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.CHEF, Role.STOREKEEPER)
  createWasteDeclaration(
    @Body() createWasteDeclarationDto: CreateWasteDeclarationDto,
  ) {
    return this.wasteService.createWasteDeclaration(createWasteDeclarationDto);
  }

  @Get()
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER)
  findAllWasteDeclarations(
    @Query('productId') productId?: string,
    @Query('reason') reason?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.wasteService.findAllWasteDeclarations(
      productId,
      reason,
      startDate,
      endDate,
    );
  }

  @Get('summary')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER)
  getWasteSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.wasteService.getWasteSummary(startDate, endDate);
  }

  @Get('product/:productId')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER)
  findByProductId(@Param('productId') productId: string) {
    return this.wasteService.findByProductId(productId);
  }

  @Get('declarer/:declarerId')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER)
  findByDeclarer(@Param('declarerId') declarerId: string) {
    return this.wasteService.findByDeclarer(declarerId);
  }

  @Get(':id')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER)
  findOneWasteDeclaration(@Param('id') id: string) {
    return this.wasteService.findOneWasteDeclaration(id);
  }

  @Patch(':id')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN)
  updateWasteDeclaration(
    @Param('id') id: string,
    @Body() updateWasteDeclarationDto: UpdateWasteDeclarationDto,
  ) {
    return this.wasteService.updateWasteDeclaration(
      id,
      updateWasteDeclarationDto,
    );
  }

  @Delete(':id')
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN)
  removeWasteDeclaration(@Param('id') id: string) {
    return this.wasteService.removeWasteDeclaration(id);
  }
}
