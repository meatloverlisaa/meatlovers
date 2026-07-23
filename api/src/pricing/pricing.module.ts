import { Module } from '@nestjs/common';
import { PricingRuleController } from './pricing-rule.controller';
import { PricingRuleService } from './pricing-rule.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PricingRuleController],
  providers: [PricingRuleService],
})
export class PricingModule {}
