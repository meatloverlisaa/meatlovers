import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WasteService } from './waste.service';
import { CreateWasteDeclarationDto } from './dto/create-waste-declaration.dto';
import { UpdateWasteDeclarationDto } from './dto/update-waste-declaration.dto';

@Controller('waste-declarations')
export class WasteController {
  constructor(private readonly wasteService: WasteService) {}

  @Post()
  createWasteDeclaration(@Body() createWasteDeclarationDto: CreateWasteDeclarationDto) {
    return this.wasteService.createWasteDeclaration(createWasteDeclarationDto);
  }

  @Get()
  findAllWasteDeclarations(
    @Query('productId') productId?: string,
    @Query('reason') reason?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.wasteService.findAllWasteDeclarations(productId, reason, startDate, endDate);
  }

  @Get('summary')
  getWasteSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.wasteService.getWasteSummary(startDate, endDate);
  }

  @Get('product/:productId')
  findByProductId(@Param('productId') productId: string) {
    return this.wasteService.findByProductId(productId);
  }

  @Get('declarer/:declarerId')
  findByDeclarer(@Param('declarerId') declarerId: string) {
    return this.wasteService.findByDeclarer(declarerId);
  }

  @Get(':id')
  findOneWasteDeclaration(@Param('id') id: string) {
    return this.wasteService.findOneWasteDeclaration(id);
  }

  @Patch(':id')
  updateWasteDeclaration(@Param('id') id: string, @Body() updateWasteDeclarationDto: UpdateWasteDeclarationDto) {
    return this.wasteService.updateWasteDeclaration(id, updateWasteDeclarationDto);
  }

  @Delete(':id')
  removeWasteDeclaration(@Param('id') id: string) {
    return this.wasteService.removeWasteDeclaration(id);
  }
}
