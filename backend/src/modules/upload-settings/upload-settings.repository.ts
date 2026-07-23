import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, isNull, desc, asc, gte, lte, between } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { uploadSettings } from './entities/upload-setting.entity';

export type UploadSetting = typeof uploadSettings.$inferSelect;

/**
 * Repository for UploadSettings
 * Extends BaseRepository for multi-tenant support and soft delete
 */
@Injectable()
export class UploadSettingsRepository extends BaseRepository<UploadSetting> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, uploadSettings, tenantContext);
  }

  /**
   * Find all with pagination, filtering, sorting
   * Uses withTenantSchema for multi-tenancy support
   */
  async findAllWithQuery(query: any): Promise<{
    data: UploadSetting[];
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
   * Find setting by category
   */
  async findByCategory(category: string): Promise<UploadSetting | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(this.table)
        .where(and(
          eq(this.table.category, category),
          isNull(this.table.deleted_at)
        ))
        .limit(1);
      return results[0] || null;
    }) as Promise<UploadSetting | null>;
  }

  /**
   * Upsert setting - insert or update if exists
   */
  async upsertSetting(
    category: string,
    url_format: string,
    thumbnail_size: number = 200,
    is_active: boolean = true,
  ): Promise<UploadSetting> {
    return this.withTenantSchema(async () => {
      // Check if exists
      const existing = await this.findByCategory(category);
      
      if (existing) {
        // Update
        const updated = await this.db
          .update(this.table)
          .set({
            url_format,
            thumbnail_size,
            is_active,
            updated_at: new Date(),
          })
          .where(eq(this.table.id, existing.id))
          .returning();
        return updated[0] as UploadSetting;
      } else {
        // Insert
        const inserted = await this.db
          .insert(this.table)
          .values({
            category,
            url_format,
            thumbnail_size,
            is_active,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning() as any[];
        return inserted[0] as UploadSetting;
      }
    }) as Promise<UploadSetting>;
  }
}
