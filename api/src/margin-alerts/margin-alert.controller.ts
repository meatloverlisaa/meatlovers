import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { MarginAlertService } from './margin-alert.service';
import { UpdateMarginAlertDto } from './dto/update-margin-alert.dto';

@Controller('margin-alerts')
export class MarginAlertController {
  constructor(private readonly marginAlertService: MarginAlertService) {}

  @Get()
  findAll() {
    return this.marginAlertService.findAll();
  }

  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMarginAlertDto,
  ) {
    return this.marginAlertService.updateStatus(id, updateDto);
  }
}

