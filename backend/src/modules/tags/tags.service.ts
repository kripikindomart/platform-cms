import { Injectable, NotFoundException } from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class TagsService {
  constructor(
    private readonly tagsRepository: TagsRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all tags with pagination, filtering, sorting
   */
  async findAll(query: QueryTagDto): Promise<{
    data: TagResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.tagsRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Find tag by ID
   */
  async findById(id: number): Promise<TagResponseDto> {
    const item = await this.tagsRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new tag
   */
  async create(dto: CreateTagDto): Promise<TagResponseDto> {
    const item = await this.tagsRepository.create({
      ...this.prepareDataForDb(dto),
      created_by: 1, // TODO: Get from current user
      updated_by: 1, // TODO: Get from current user
    } as any);

    await this.auditService.logCrud({
      action: 'create',
      resource: 'tags',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update tag
   */
  async update(id: number, dto: UpdateTagDto): Promise<TagResponseDto> {
    // Check if exists
    await this.findById(id);

    const item = await this.tagsRepository.update(id, {
      ...this.prepareDataForDb(dto),
      updated_by: 1, // TODO: Get from current user
    } as any);

    await this.auditService.logCrud({
      action: 'update',
      resource: 'tags',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete tag
   */
  async softDelete(id: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    await this.tagsRepository.softDelete(id, 1); // TODO: Get from current user

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'tags',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted tag
   */
  async restore(id: number): Promise<TagResponseDto> {
    const item = await this.tagsRepository.restore(id);

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'tags',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): TagResponseDto {
    return {
      id: item.id,
      name: item.name ?? undefined,
      slug: item.slug ?? undefined,
      color: item.color ?? undefined,
      usage_count: item.usage_count ?? undefined,
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
