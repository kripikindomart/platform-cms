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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { TenantContextService } from '../../common/context/tenant-context.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly tenantContext: TenantContextService,
  ) {
    // Set default tenant context for testing
    // TODO: Replace with proper tenant middleware
    this.tenantContext.setTenant({
      id: 1,
      slug: 'tenant_1',
      name: 'Default Tenant',
      schemaName: 'tenant_1',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of categories' })
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.categoriesService.softDelete(id);
  }
}
