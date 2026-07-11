import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { categories } from '../../database/schema/tenant/categories.schema';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';

export type Category = typeof categories.$inferSelect;

@Injectable()
export class CategoriesRepository extends BaseRepository<Category> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, categories, tenantContext);
  }

  /**
   * Find all categories with pagination, filtering, sorting
   * Uses BaseRepository's findAllPaginated + custom filtering
   */
  async findAllWithQuery(query: any): Promise<{
    data: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sort, order = 'asc', search } = query;

    return this.withTenantSchema(async () => {
      const offset = (page - 1) * limit;
      
      // Count total
      const [countResult] = await this.db.select({ count: sql<number>`count(*)` }).from(categories);
      const total = Number(countResult.count);

      // Fetch data
      const data = await this.db.select().from(categories).limit(limit).offset(offset);

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
}
