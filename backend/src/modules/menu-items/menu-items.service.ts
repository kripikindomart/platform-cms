import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuItemsRepository } from './menu-items.repository';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly menuItemsRepository: MenuItemsRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all menu-items with pagination, filtering, sorting
   */
  async findAll(query: QueryMenuItemDto): Promise<{
    data: MenuItemResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.menuItemsRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Find menu-item by ID
   */
  async findById(id: number): Promise<MenuItemResponseDto> {
    const item = await this.menuItemsRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new menu-item
   */
  async create(dto: CreateMenuItemDto, userId: number): Promise<MenuItemResponseDto> {
    // BaseRepository.create() handles audit fields (created_by, updated_by, timestamps)
    const item = await this.menuItemsRepository.create(this.prepareDataForDb(dto), userId);

    await this.auditService.logCrud({
      action: 'create',
      resource: 'menu-items',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update menu-item
   */
  async update(id: number, dto: UpdateMenuItemDto, userId: number): Promise<MenuItemResponseDto> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.update() handles audit fields (updated_by, updated_at)
    const item = await this.menuItemsRepository.update(id, this.prepareDataForDb(dto), userId);

    await this.auditService.logCrud({
      action: 'update',
      resource: 'menu-items',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete menu-item
   */
  async delete(id: number, userId: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.softDelete() handles soft delete fields
    await this.menuItemsRepository.softDelete(id, userId);

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'menu-items',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted menu-item
   */
  async restore(id: number): Promise<MenuItemResponseDto> {
    await this.menuItemsRepository.restore(id);

    // Fetch restored item
    const item = await this.menuItemsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`MenuItem with ID ${id} not found after restore`);
    }

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'menu-items',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): MenuItemResponseDto {
    return {
      id: item.id,
      menu_id: item.menu_id ?? undefined,
      parent_id: item.parent_id ?? undefined,
      module_name: item.module_name ?? undefined,
      label: item.label ?? undefined,
      url: item.url ?? undefined,
      icon: item.icon ?? undefined,
      order: item.order ?? undefined,
      is_active: item.is_active ?? undefined,
      required_permission: item.required_permission ?? undefined,
      metadata: item.metadata ?? undefined,
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
