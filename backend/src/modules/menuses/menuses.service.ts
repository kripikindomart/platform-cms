import { Injectable, NotFoundException } from '@nestjs/common';
import { MenusRepository } from './menuses.repository';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class MenusService {
  constructor(
    private readonly menusRepository: MenusRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all menuses with pagination, filtering, sorting
   */
  async findAll(query: QueryMenuDto): Promise<{
    data: MenuResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.menusRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item: any) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Find menu by ID
   */
  async findById(id: number): Promise<MenuResponseDto> {
    const item = await this.menusRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new menu
   */
  async create(dto: CreateMenuDto, userId: number): Promise<MenuResponseDto> {
    // BaseRepository.create() handles audit fields (created_by, updated_by, timestamps)
    const item = await this.menusRepository.create(this.prepareDataForDb(dto), userId);

    await this.auditService.logCrud({
      action: 'create',
      resource: 'menuses',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update menu
   */
  async update(id: number, dto: UpdateMenuDto, userId: number): Promise<MenuResponseDto> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.update() handles audit fields (updated_by, updated_at)
    const item = await this.menusRepository.update(id, this.prepareDataForDb(dto), userId);

    await this.auditService.logCrud({
      action: 'update',
      resource: 'menuses',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete menu
   */
  async delete(id: number, userId: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.softDelete() handles soft delete fields
    await this.menusRepository.softDelete(id, userId);

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'menuses',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted menu
   */
  async restore(id: number): Promise<MenuResponseDto> {
    await this.menusRepository.restore(id);

    // Fetch restored item
    const item = await this.menusRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Menu with ID ${id} not found after restore`);
    }

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'menuses',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Get active menus with nested menu items
   */
  async getActiveMenus(): Promise<any[]> {
    return this.menusRepository.findActiveMenusWithItems();
  }

  /**
   * Get menus for current user (filtered by permissions)
   */
  async getMenusForUser(user: any): Promise<any[]> {
    try {
      // Get all active menus with items
      const menus = await this.getActiveMenus();
      
      // Filter menu items by user permissions
      const filteredMenus = menus.map((menu) => ({
        ...menu,
        items: this.filterMenuItemsByPermissions(menu.items, user),
      })).filter((menu) => menu.items.length > 0); // Only return menus that have items

      return filteredMenus;
    } catch (error: any) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist')) {
        console.warn('[MenusService] Menus table does not exist, returning empty array');
        return [];
      }
      throw error;
    }
  }

  /**
   * Filter menu items by user permissions
   * TODO: Implement actual permission checking
   */
  private filterMenuItemsByPermissions(items: any[], user: any): any[] {
    if (!items || items.length === 0) return [];

    return items
      .filter((item) => {
        // TODO: Check if user has required_permission
        // For now, allow all items
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children 
          ? this.filterMenuItemsByPermissions(item.children, user)
          : undefined,
      }));
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): MenuResponseDto {
    return {
      id: item.id,
      name: item.name ?? undefined,
      slug: item.slug ?? undefined,
      icon: item.icon ?? undefined,
      order: item.order ?? undefined,
      is_active: item.is_active ?? undefined,
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
