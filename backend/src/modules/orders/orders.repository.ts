import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, isNull, desc, asc, gte, lte, between } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { orders } from './entities/order.entity';

export type Order = typeof orders.$inferSelect;

/**
 * Repository for Orders
 * Extends BaseRepository for multi-tenant support and soft delete
 */
@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, orders, tenantContext);
  }

  /**
   * Find all with pagination, filtering, sorting
   * Uses withTenantSchema for multi-tenancy support
   */
  async findAllWithQuery(query: any): Promise<{
    data: Order[];
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

      // Apply search (case-insensitive)
      if (search) {
        const { or, ilike } = await import('drizzle-orm');
        const searchConditions = [ilike(this.table.customer_name, `%${search}%`)];
        if (searchConditions.length > 0) {
          conditions.push(or(...searchConditions)!);
        }
      }

      // Apply filters
      // Number field with range support
      if (query.total !== undefined) {
        conditions.push(eq(this.table.total, query.total));
      } else if (query.total_min !== undefined && query.total_max !== undefined) {
        conditions.push(between(this.table.total, query.total_min, query.total_max));
      } else if (query.total_min !== undefined) {
        conditions.push(gte(this.table.total, query.total_min));
      } else if (query.total_max !== undefined) {
        conditions.push(lte(this.table.total, query.total_max));
      }
      // Date field with range support
      if (query.order_date !== undefined) {
        conditions.push(eq(this.table.order_date, new Date(query.order_date)));
      } else if (query.order_date_from && query.order_date_to) {
        conditions.push(
          between(
            this.table.order_date,
            new Date(query.order_date_from),
            new Date(query.order_date_to),
          ),
        );
      } else if (query.order_date_from) {
        conditions.push(gte(this.table.order_date, new Date(query.order_date_from)));
      } else if (query.order_date_to) {
        conditions.push(lte(this.table.order_date, new Date(query.order_date_to)));
      }
      // Standard field
      if (query.status !== undefined) {
        if (query.status === null) {
          conditions.push(isNull(this.table.status));
        } else {
          conditions.push(eq(this.table.status, query.status));
        }
      }

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
  // Example:
  // async findBySlug(slug: string): Promise<Order | null> {
  //   return this.withTenantSchema(async () => {
  //     const results = await this.db
  //       .select()
  //       .from(this.table)
  //       .where(and(
  //         eq(this.table.slug, slug),
  //         isNull(this.table.deleted_at)
  //       ))
  //       .limit(1);
  //     return results[0] || null;
  //   });
  // }
}
