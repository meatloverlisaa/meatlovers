import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from './dto/update-production-plan.dto';

@Injectable()
export class ProductionPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createProductionPlanDto: CreateProductionPlanDto) {
    const { recipe_id, planned_quantity, planned_date, notes } = createProductionPlanDto;

    // Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: BigInt(recipe_id) },
      include: { product: true },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (!recipe.is_active) {
      throw new BadRequestException('Recipe is not active');
    }

    // Create production plan
    const productionPlan = await this.prisma.productionPlan.create({
      data: {
        recipe_id: BigInt(recipe_id),
        planned_quantity,
        planned_date: new Date(planned_date),
        notes,
      },
      include: {
        recipe: {
          include: {
            product: true,
          },
        },
      },
    });

    return productionPlan;
  }

  async findAll(status?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.planned_date = {};
      if (startDate) {
        where.planned_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.planned_date.lte = new Date(endDate);
      }
    }

    return this.prisma.productionPlan.findMany({
      where,
      include: {
        recipe: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        planned_date: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const productionPlan = await this.prisma.productionPlan.findUnique({
      where: { id: BigInt(id) },
      include: {
        recipe: {
          include: {
            product: true,
            ingredients: {
              include: {
                stock_item: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!productionPlan) {
      throw new NotFoundException('Production plan not found');
    }

    return productionPlan;
  }

  async findByRecipeId(recipeId: string) {
    return this.prisma.productionPlan.findMany({
      where: { recipe_id: BigInt(recipeId) },
      include: {
        recipe: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        planned_date: 'desc',
      },
    });
  }

  async update(id: string, updateProductionPlanDto: UpdateProductionPlanDto) {
    const { recipe_id, planned_quantity, produced_quantity, planned_date, notes, status } =
      updateProductionPlanDto;

    // Check if production plan exists
    const existingPlan = await this.prisma.productionPlan.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingPlan) {
      throw new NotFoundException('Production plan not found');
    }

    // If updating recipe_id, check if recipe exists
    if (recipe_id) {
      const recipe = await this.prisma.recipe.findUnique({
        where: { id: BigInt(recipe_id) },
      });

      if (!recipe) {
        throw new NotFoundException('Recipe not found');
      }
    }

    // If updating produced_quantity, validate it doesn't exceed planned_quantity
    if (produced_quantity !== undefined && planned_quantity !== undefined) {
      if (produced_quantity > planned_quantity) {
        throw new BadRequestException('Produced quantity cannot exceed planned quantity');
      }
    }

    // If status is being updated to COMPLETED, set completed_date
    const updateData: any = {};
    if (recipe_id) updateData.recipe_id = BigInt(recipe_id);
    if (planned_quantity !== undefined) updateData.planned_quantity = planned_quantity;
    if (produced_quantity !== undefined) updateData.produced_quantity = produced_quantity;
    if (planned_date) updateData.planned_date = new Date(planned_date);
    if (notes !== undefined) updateData.notes = notes;
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completed_date = new Date();
      }
    }

    const updatedPlan = await this.prisma.productionPlan.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        recipe: {
          include: {
            product: true,
          },
        },
      },
    });

    return updatedPlan;
  }

  async updateProducedQuantity(id: string, producedQuantity: number) {
    const productionPlan = await this.prisma.productionPlan.findUnique({
      where: { id: BigInt(id) },
    });

    if (!productionPlan) {
      throw new NotFoundException('Production plan not found');
    }

    if (producedQuantity > productionPlan.planned_quantity) {
      throw new BadRequestException('Produced quantity cannot exceed planned quantity');
    }

    const updatedPlan = await this.prisma.productionPlan.update({
      where: { id: BigInt(id) },
      data: {
        produced_quantity: producedQuantity,
        status: producedQuantity >= productionPlan.planned_quantity ? 'COMPLETED' : 'IN_PROGRESS',
        completed_date: producedQuantity >= productionPlan.planned_quantity ? new Date() : null,
      },
      include: {
        recipe: {
          include: {
            product: true,
          },
        },
      },
    });

    return updatedPlan;
  }

  async remove(id: string) {
    const productionPlan = await this.prisma.productionPlan.findUnique({
      where: { id: BigInt(id) },
    });

    if (!productionPlan) {
      throw new NotFoundException('Production plan not found');
    }

    await this.prisma.productionPlan.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Production plan deleted successfully' };
  }

  async getProductionSummary(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.planned_date = {};
      if (startDate) {
        where.planned_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.planned_date.lte = new Date(endDate);
      }
    }

    const plans = await this.prisma.productionPlan.findMany({
      where,
      include: {
        recipe: {
          include: {
            product: true,
          },
        },
      },
    });

    const summary = {
      totalPlans: plans.length,
      planned: plans.filter((p) => p.status === 'PLANNED').length,
      inProgress: plans.filter((p) => p.status === 'IN_PROGRESS').length,
      completed: plans.filter((p) => p.status === 'COMPLETED').length,
      cancelled: plans.filter((p) => p.status === 'CANCELLED').length,
      totalPlannedQuantity: plans.reduce((sum, p) => sum + p.planned_quantity, 0),
      totalProducedQuantity: plans.reduce((sum, p) => sum + p.produced_quantity, 0),
      completionRate:
        plans.reduce((sum, p) => sum + p.planned_quantity, 0) > 0
          ? (plans.reduce((sum, p) => sum + p.produced_quantity, 0) /
              plans.reduce((sum, p) => sum + p.planned_quantity, 0)) *
            100
          : 0,
      plans,
    };

    return summary;
  }
}
