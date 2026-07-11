import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { categories } from '../../database/schema/tenant/categories.schema';

@Injectable()
export class CategoriesRepository extends BaseRepository<typeof categories.$inferSelect> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, categories, tenantContext);
  }

  /**
   * Find all with pagination, filtering, sorting, and search
   */
  async findAllWithQuery(query: any): Promise<{
    data: (typeof categories.$inferSelect)[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, sort, order = 'asc', search } = query;
    const offset = (page - 1) * limit;

    return this.withTenantSchema(async () => {
      const { and, or, eq, ilike, isNull, sql, asc, desc } = await import('drizzle-orm');

      // Build WHERE conditions
      const conditions: any[] = [isNull(this.table.deleted_at)];

      // Apply filters
      if (query.parent_id !== undefined) {
        if (query.parent_id === null) {
          conditions.push(isNull(this.table.parent_id));
        } else {
          conditions.push(eq(this.table.parent_id, query.parent_id));
        }
      }
      if (query.type !== undefined) {
        conditions.push(eq(this.table.type, query.type));
      }

      // Apply search (case-insensitive)
      if (search) {
        const searchConditions = [
          ilike(this.table.name, `%${search}%`),
          ilike(this.table.description, `%${search}%`),
        ];
        if (searchConditions.length > 0) {
          conditions.push(or(...searchConditions)!);
        }
      }

      const whereClause = and(...conditions);

      // Get total count
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(this.table)
        .where(whereClause);
      const total = Number(countResult[0]?.count || 0);

      // Build main query
      let dbQuery: any = this.db.select().from(this.table).where(whereClause);

      // Apply sorting
      const sortField = sort || 'created_at';
      if (order === 'desc') {
        dbQuery = dbQuery.orderBy(desc(this.table[sortField]));
      } else {
        dbQuery = dbQuery.orderBy(asc(this.table[sortField]));
      }

      // Apply pagination
      const data = await dbQuery.limit(limit).offset(offset);

      return {
        data,
        total,
        page,
        limit,
      };
    });
  }

  // Add custom query methods here
}
