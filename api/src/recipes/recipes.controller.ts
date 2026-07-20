import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Public } from '../auth/public.decorator';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @Public()
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Get('product/:productId')
  @Public()
  findByProductId(@Param('productId') productId: string) {
    return this.recipesService.findByProductId(productId);
  }

  @Patch(':id')
  @Public()
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}
