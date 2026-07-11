import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { tags } from '../../database/schema/tenant/tags.schema';

@Injectable()
export class TagsRepository extends BaseRepository<typeof tags.$inferSelect> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, tags, tenantContext);
  }

  /**
   * Find all with pagination, filtering, sorting, and search
   */
  async findAllWithQuery(query: any): Promise<{
    data: (typeof tags.$inferSelect)[];
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
      if (query.color !== undefined) {
        conditions.push(eq(this.table.color, query.color));
      }

      // Apply search (case-insensitive)
      if (search) {
        const searchConditions = [ilike(this.table.name, `%${search}%`)];
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
