import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, desc, asc } from 'drizzle-orm';
import * as publicSchema from '../../database/schema/public';
import { settings } from './entities/setting.entity';

export type Setting = typeof settings.$inferSelect;

/**
 * Repository for Settings (Public Schema)
 * Global application settings - NOT tenant-specific
 * Direct database access without BaseRepository
 */
@Injectable()
export class SettingsRepository {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof publicSchema>,
  ) {}

  /**
   * Find all settings with pagination
   */
  async findAll(query: any): Promise<{
    data: Setting[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, sort = 'category', order = 'asc', category } = query;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: any[] = [];
    if (category) {
      conditions.push(eq(settings.category, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(settings)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Build main query with sorting
    let dbQuery: any = this.db.select().from(settings);
    
    if (whereClause) {
      dbQuery = dbQuery.where(whereClause);
    }

    // Apply sorting
    const sortColumn = settings[sort as keyof typeof settings] as any;
    if (sortColumn) {
      dbQuery = order === 'desc' ? dbQuery.orderBy(desc(sortColumn)) : dbQuery.orderBy(asc(sortColumn));
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
  }

  /**
   * Find setting by category and key
   */
  async findByCategoryAndKey(category: string, key: string): Promise<Setting | null> {
    const results = await this.db
      .select()
      .from(settings)
      .where(and(
        eq(settings.category, category),
        eq(settings.key, key)
      ))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find all settings by category
   */
  async findByCategory(category: string): Promise<Setting[]> {
    return await this.db
      .select()
      .from(settings)
      .where(eq(settings.category, category))
      .orderBy(asc(settings.key));
  }

  /**
   * Create new setting
   */
  async create(data: Partial<Setting>): Promise<Setting> {
    const results = await this.db
      .insert(settings)
      .values(data as any)
      .returning();
    return results[0];
  }

  /**
   * Update setting by ID
   */
  async update(id: number, data: Partial<Setting>): Promise<Setting | null> {
    const results = await this.db
      .update(settings)
      .set({ ...data, updated_at: new Date() })
      .where(eq(settings.id, id))
      .returning();
    return results[0] || null;
  }

  /**
   * Upsert setting by category and key
   */
  async upsert(category: string, key: string, value: any, userId?: number): Promise<Setting> {
    const existing = await this.findByCategoryAndKey(category, key);
    
    if (existing) {
      return this.update(existing.id, { 
        value, 
        updated_by: userId,
        updated_at: new Date() 
      }) as Promise<Setting>;
    }
    
    return this.create({
      category,
      key,
      value,
      updated_by: userId,
    });
  }

  /**
   * Delete setting by ID (hard delete - use with caution)
   */
  async delete(id: number): Promise<void> {
    await this.db
      .delete(settings)
      .where(eq(settings.id, id));
  }
}
