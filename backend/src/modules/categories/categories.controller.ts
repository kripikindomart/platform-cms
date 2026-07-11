import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, CaslGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'categories'))
  @ApiOperation({ summary: 'Get all categories with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of categories' })
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'categories'))
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoriesService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'categories'))
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'categories'))
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'categories'))
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.categoriesService.delete(id, user.id);
  }
}
