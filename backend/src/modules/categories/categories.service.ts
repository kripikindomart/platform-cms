import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * Find all categories with pagination, filtering, sorting
   */
  async findAll(query: QueryCategoryDto): Promise<{
    data: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.categoriesRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Find category by ID
   */
  async findById(id: number): Promise<CategoryResponseDto> {
    const item = await this.categoriesRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new category
   */
  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // BaseRepository.create() already handles created_by, updated_by, created_at, updated_at
    const item = await this.categoriesRepository.create({
      ...dto,
    }, 1); // TODO: Get user ID from @CurrentUser() decorator

    return this.toResponseDto(item);
  }

  /**
   * Update category
   */
  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.update() already handles updated_by, updated_at
    const item = await this.categoriesRepository.update(id, dto, 1); // TODO: Get user ID from @CurrentUser()

    return this.toResponseDto(item);
  }

  /**
   * Delete category (soft delete)
   */
  async delete(id: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    // Use soft delete from BaseRepository
    await this.categoriesRepository.softDelete(id, 1); // TODO: Get user ID from @CurrentUser()
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): CategoryResponseDto {
    return {
      id: item.id,
      parent_id: item.parent_id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      type: item.type,
      order: item.order,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  /**
   * Prepare DTO data for database
   * Converts number fields to string for decimal/numeric types
   */
  private prepareDataForDb(dto: any): any {
    const data = { ...dto };

    return data;
  }
}
