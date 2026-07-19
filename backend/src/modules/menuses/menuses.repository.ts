import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, isNull, desc, asc, gte, lte, between } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { menus } from '../../database/schema/tenant/menus.schema';

export type Menu = typeof menus.$inferSelect;

/**
 * Repository for Menuses
 * Extends BaseRepository for multi-tenant support and soft delete
 */
@Injectable()
export class MenusRepository extends BaseRepository<Menu> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, menus, tenantContext);
  }

  /**
   * Find all with pagination, filtering, sorting
   * Uses withTenantSchema for multi-tenancy support
   */
  async findAllWithQuery(query: any): Promise<{
    data: Menu[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sort = 'created_at', order = 'asc', search } = query;
    const offset = (page - 1) * limit;

    return this.withTenantSchema(async () => {
      // Build WHERE conditions
      const conditions: any[] = [isNull(this.table.deleted_at)];

      const whereClause = and(...conditions);

      // Get total count
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(this.table)
        .where(whereClause);
      const total = Number(countResult[0]?.count || 0);

      // Build main query with sorting
      let dbQuery: any = this.db.select().from(this.table).where(whereClause);

      // Apply sorting
      const sortColumn = this.table[sort as keyof typeof this.table] as any;
      if (sortColumn) {
        dbQuery =
          order === 'desc' ? dbQuery.orderBy(desc(sortColumn)) : dbQuery.orderBy(asc(sortColumn));
      }

      // Apply pagination
      const data = await dbQuery.limit(limit).offset(offset);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  // Add custom query methods here
  
  /**
   * Get all active menus with nested menu items
   */
  async findActiveMenusWithItems(): Promise<any[]> {
    return this.withTenantSchema(async () => {
      // Query all active menus
      const activeMenus = await this.db
        .select()
        .from(menus)
        .where(and(
          eq(menus.is_active, true),
          isNull(menus.deleted_at)
        ))
        .orderBy(asc(menus.order));

      // For each menu, get its items with nested structure
      const menusWithItems = await Promise.all(
        activeMenus.map(async (menu) => {
          // Get menu items - must be called within withTenantSchema context
          const items = await this.getMenuItemsNested(menu.id);
          return {
            ...menu,
            items,
          };
        })
      );

      return menusWithItems;
    });
  }

  /**
   * Get menu items with nested structure (children)
   * NOTE: This must be called within withTenantSchema context
   */
  private async getMenuItemsNested(menuId: number, parentId: number | null = null): Promise<any[]> {
    // Get schema name from tenant context
    const schemaName = this.tenantContext.getSchemaName();
    
    // Query items at current level using fully qualified table name
    const items = await this.db.execute(sql`
      SELECT * FROM ${sql.raw(`"${schemaName}".menu_items`)}
      WHERE menu_id = ${menuId}
        AND ${parentId === null ? sql`parent_id IS NULL` : sql`parent_id = ${parentId}`}
        AND is_active = true
        AND deleted_at IS NULL
      ORDER BY "order" ASC
    `);

    // Recursively get children for each item
    const itemsWithChildren = await Promise.all(
      (items.rows as any[]).map(async (item) => {
        const children = await this.getMenuItemsNested(menuId, item.id);
        return {
          ...item,
          children: children.length > 0 ? children : undefined,
        };
      })
    );

    return itemsWithChildren;
  }
}
