import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MarginAlertService } from './margin-alert.service';
import { UpdateMarginAlertDto } from './dto/update-margin-alert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '@prisma/client';

@Controller('margin-alerts')
@UseGuards(JwtAuthGuard)
export class MarginAlertController {
  constructor(private readonly marginAlertService: MarginAlertService) {}

  @Get()
  @Public() // Temporary for development - remove in production
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  findAll() {
    return this.marginAlertService.findAll();
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMarginAlertDto,
  ) {
    return this.marginAlertService.updateStatus(id, updateDto);
  }
}
