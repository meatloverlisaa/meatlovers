import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { ApplyPricingRuleDto } from './dto/apply-pricing-rule.dto';
import { PricingRuleType, ProductCategory } from '@prisma/client';



@Injectable()
export class PricingRuleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePricingRuleDto) {
    return this.prisma.pricingRule.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.pricingRule.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const rule = await this.prisma.pricingRule.findUnique({
      where: { id: BigInt(id) },
    });

    if (!rule) {
      throw new NotFoundException(`Pricing rule with ID ${id} not found`);
    }

    return rule;
  }

  async update(id: number, updateDto: UpdatePricingRuleDto) {
    await this.findOne(id);

    return this.prisma.pricingRule.update({
      where: { id: BigInt(id) },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.pricingRule.delete({
      where: { id: BigInt(id) },
    });
  }

  async applyToProduct(ruleId: number, applyDto: ApplyPricingRuleDto) {
    // NOTE: This assumes pricing rules apply to a product explicitly by productId.
    // If you later want category-based auto-application, we can extend.
    const rule = await this.findOne(ruleId);

    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(applyDto.productId) },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${applyDto.productId} not found`);
    }

    // If rule is scoped by category, enforce it.
    if (rule.product_category && rule.product_category !== (product.product_category as ProductCategory)) {
      // treat as no-op audit entry? For now, reject.
      throw new NotFoundException(
        `Pricing rule does not apply to product category ${product.product_category}`,
      );
    }

    const currentSelling = Number(product.selling_price);
    const newSelling = this.calculateNewPrice({
      ruleType: rule.rule_type as PricingRuleType,
      value: rule.value.toString(),
      currentSelling,
      minSellingPrice: rule.min_selling_price?.toString() ?? null,
      maxSellingPrice: rule.max_selling_price?.toString() ?? null,
    });

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: BigInt(applyDto.productId) },
        data: { selling_price: newSelling.toFixed(2) },
      });

      const audit = await tx.priceChangeAuditTrail.create({
        data: {
          product_id: BigInt(applyDto.productId),
          pricing_rule_id: BigInt(rule.id.toString()),
          actor_user_id: BigInt(applyDto.actorUserId),
          old_selling_price: currentSelling.toFixed(2),
          new_selling_price: newSelling.toFixed(2),
          note: applyDto.note ?? null,
        },
      });

      return { product: updated, audit };
    });
  }

  private calculateNewPrice(opts: {
    ruleType: PricingRuleType;
    value: string; // Decimal stored as string
    currentSelling: number;
    minSellingPrice: string | null;
    maxSellingPrice: string | null;
  }): number {
    const ruleValue = Number(opts.value);

    let next = opts.currentSelling;
    switch (opts.ruleType) {
      case 'FIXED_PRICE':
        next = ruleValue;
        break;
      case 'PERCENT_INCREASE':
        next = opts.currentSelling * (1 + ruleValue / 100);
        break;
      case 'PERCENT_DECREASE':
        next = opts.currentSelling * (1 - ruleValue / 100);
        break;
      default:
        // fallback: no-op
        next = opts.currentSelling;
    }

    if (opts.minSellingPrice !== null) {
      next = Math.max(next, Number(opts.minSellingPrice));
    }
    if (opts.maxSellingPrice !== null) {
      next = Math.min(next, Number(opts.maxSellingPrice));
    }

    // round to 2 decimals
    return Math.round(next * 100) / 100;
  }
}

