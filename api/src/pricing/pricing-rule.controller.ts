import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PricingRuleService } from './pricing-rule.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { ApplyPricingRuleDto } from './dto/apply-pricing-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '@prisma/client';

@Controller('pricing-rules')
@UseGuards(JwtAuthGuard)
export class PricingRuleController {
  constructor(private readonly pricingRuleService: PricingRuleService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  create(@Body() createDto: CreatePricingRuleDto) {
    return this.pricingRuleService.create(createDto);
  }

  @Get()
  @Public() // Temporary for development - remove in production
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  findAll() {
    return this.pricingRuleService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pricingRuleService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePricingRuleDto) {
    return this.pricingRuleService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pricingRuleService.remove(id);
  }

  @Post(':id/apply')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() applyDto: ApplyPricingRuleDto,
  ) {
    return this.pricingRuleService.applyToProduct(id, applyDto);
  }
}

