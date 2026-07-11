import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, isNull, desc, asc, gte, lte, between } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { tags } from './entities/tag.entity';

export type Tag = typeof tags.$inferSelect;

/**
 * Repository for Tags
 * Extends BaseRepository for multi-tenant support and soft delete
 */
@Injectable()
export class TagsRepository extends BaseRepository<Tag> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, tags, tenantContext);
  }

  /**
   * Find all with pagination, filtering, sorting
   * Uses withTenantSchema for multi-tenancy support
   */
  async findAllWithQuery(query: any): Promise<{
    data: Tag[];
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
  // Example:
  // async findBySlug(slug: string): Promise<Tag | null> {
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
