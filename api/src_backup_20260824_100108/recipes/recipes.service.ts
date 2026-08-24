/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = createRecipeDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(createRecipeDto.product_id) },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if recipe already exists for this product
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { product_id: BigInt(createRecipeDto.product_id) },
    });

    if (existingRecipe) {
      throw new BadRequestException('Recipe already exists for this product');
    }

    // Validate all stock items exist
    for (const ingredient of ingredients) {
      const stockItem = await this.prisma.stockItem.findUnique({
        where: { id: BigInt(ingredient.stock_item_id) },
      });

      if (!stockItem) {
        throw new NotFoundException(
          `Stock item with ID ${ingredient.stock_item_id} not found`,
        );
      }
    }

    // Create recipe with ingredients
    const recipe = await this.prisma.recipe.create({
      data: {
        product_id: BigInt(createRecipeDto.product_id),
        name: createRecipeDto.name,
        instructions: createRecipeDto.instructions,
        is_active: createRecipeDto.is_active ?? true,
        ingredients: {
          create: ingredients.map((ing) => ({
            stock_item_id: BigInt(ing.stock_item_id),
            quantity: parseFloat(ing.quantity),
            unit: ing.unit || 'units',
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            stock_item: {
              include: {
                product: true,
              },
            },
          },
        },
        product: true,
      },
    });

    return recipe;
  }

  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            stock_item: {
              include: {
                product: true,
              },
            },
          },
        },
        product: true,
      },
    });
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: BigInt(id) },
      include: {
        ingredients: {
          include: {
            stock_item: {
              include: {
                product: true,
              },
            },
          },
        },
        product: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async findByProductId(productId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { product_id: BigInt(productId) },
      include: {
        ingredients: {
          include: {
            stock_item: {
              include: {
                product: true,
              },
            },
          },
        },
        product: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found for this product');
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const { ingredients, ...recipeData } = updateRecipeDto;

    // Check if recipe exists
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    // If updating product_id, check if product exists
    if (recipeData.product_id) {
      const product = await this.prisma.product.findUnique({
        where: { id: BigInt(recipeData.product_id) },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }

    // If updating ingredients, validate stock items
    if (ingredients) {
      for (const ingredient of ingredients) {
        if (ingredient.stock_item_id) {
          const stockItem = await this.prisma.stockItem.findUnique({
            where: { id: BigInt(ingredient.stock_item_id) },
          });

          if (!stockItem) {
            throw new NotFoundException(
              `Stock item with ID ${ingredient.stock_item_id} not found`,
            );
          }
        }
      }
    }

    // Update recipe
    const updatedRecipe = await this.prisma.recipe.update({
      where: { id: BigInt(id) },
      data: {
        ...(recipeData.product_id && {
          product_id: BigInt(recipeData.product_id),
        }),
        ...(recipeData.name && { name: recipeData.name }),
        ...(recipeData.instructions !== undefined && {
          instructions: recipeData.instructions,
        }),
        ...(recipeData.is_active !== undefined && {
          is_active: recipeData.is_active,
        }),
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients.map((ing) => ({
              stock_item_id: BigInt(ing.stock_item_id),
              quantity: parseFloat(ing.quantity),
              unit: ing.unit || 'units',
            })),
          },
        }),
      },
      include: {
        ingredients: {
          include: {
            stock_item: {
              include: {
                product: true,
              },
            },
          },
        },
        product: true,
      },
    });

    return updatedRecipe;
  }

  async remove(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: BigInt(id) },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    await this.prisma.recipe.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Recipe deleted successfully' };
  }

  async consumeIngredients(productId: string, quantity: number): Promise<void> {
    // Find recipe for the product
    const recipe = await this.prisma.recipe.findUnique({
      where: { product_id: BigInt(productId) },
      include: {
        ingredients: {
          include: {
            stock_item: {
              include: {
                product: true,
              },
            },
          },
        },
        product: true,
      },
    });

    if (!recipe || !recipe.is_active) {
      // No recipe or inactive recipe - skip consumption
      return;
    }

    // Consume ingredients based on recipe
    for (const ingredient of recipe.ingredients) {
      const requiredQuantity = Number(ingredient.quantity) * quantity;
      const stockItem = ingredient.stock_item;

      if (stockItem.quantity < requiredQuantity) {
        throw new BadRequestException(
          `Insufficient stock for ${stockItem.product.product_name}. Required: ${requiredQuantity}, Available: ${stockItem.quantity}`,
        );
      }

      // Update stock quantity
      await this.prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          quantity: stockItem.quantity - requiredQuantity,
        },
      });

      // Create stock movement record
      await this.prisma.stockMovement.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: 'WASTE',
          quantity: -requiredQuantity,
          reference: `Recipe consumption for order - Product: ${recipe.product.product_name}`,
          notes: `Consumed ${requiredQuantity} ${ingredient.unit} for ${quantity} unit(s) of ${recipe.name}`,
        },
      });
    }
  }
}
