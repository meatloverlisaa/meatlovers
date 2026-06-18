import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { PricingRuleService } from './pricing-rule.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { ApplyPricingRuleDto } from './dto/apply-pricing-rule.dto';

@Controller('pricing-rules')
export class PricingRuleController {
  constructor(private readonly pricingRuleService: PricingRuleService) {}

  @Post()
  create(@Body() createDto: CreatePricingRuleDto) {
    return this.pricingRuleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.pricingRuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pricingRuleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePricingRuleDto) {
    return this.pricingRuleService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pricingRuleService.remove(id);
  }

  @Post(':id/apply')
  apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() applyDto: ApplyPricingRuleDto,
  ) {
    return this.pricingRuleService.applyToProduct(id, applyDto);
  }
}

