import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly auditService: AuditService,
  ) {}

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
    const item = await this.categoriesRepository.create({
      ...this.prepareDataForDb(dto),
      created_by: 1, // TODO: Get from current user
      updated_by: 1, // TODO: Get from current user
    } as any);

    await this.auditService.logCrud({
      action: 'create',
      resource: 'categories',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update category
   */
  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    // Check if exists
    await this.findById(id);

    const item = await this.categoriesRepository.update(id, {
      ...this.prepareDataForDb(dto),
      updated_by: 1, // TODO: Get from current user
    } as any);

    await this.auditService.logCrud({
      action: 'update',
      resource: 'categories',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete category
   */
  async softDelete(id: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    await this.categoriesRepository.softDelete(id, 1); // TODO: Get from current user

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'categories',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted category
   */
  async restore(id: number): Promise<CategoryResponseDto> {
    const item = await this.categoriesRepository.restore(id);

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'categories',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): CategoryResponseDto {
    return {
      id: item.id,
      parent_id: item.parent_id ?? undefined,
      name: item.name ?? undefined,
      slug: item.slug ?? undefined,
      description: item.description ?? undefined,
      type: item.type ?? undefined,
      order: item.order ?? undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at ?? undefined,
    };
  }

  /**
   * Prepare DTO data for database
   * Converts number fields to string for decimal/numeric types
   */
  private prepareDataForDb(dto: any): any {
    const data = { ...dto };

    // Convert decimal/numeric fields from number to string for Drizzle ORM

    return data;
  }
}
