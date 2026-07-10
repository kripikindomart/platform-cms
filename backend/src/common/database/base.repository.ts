import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, isNull, and, sql, not } from 'drizzle-orm';
import { TenantContextService } from '../context/tenant-context.service';
import {
  IRepository,
  RepositoryEntity,
  PaginationOptions,
  PaginatedResult,
} from './repository.interface';

/**
 * Abstract base repository with soft delete support
 */
@Injectable()
export abstract class BaseRepository<T extends RepositoryEntity>
  implements IRepository<T>
{
  protected readonly logger: Logger;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject('DRIZZLE') protected readonly db: NodePgDatabase<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly table: any,
    protected readonly tenantContext: TenantContextService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Execute query within tenant schema context
   * Automatically sets and resets search_path
   */
  protected async withTenantSchema<R>(fn: () => Promise<R>): Promise<R> {
    const schemaName = this.tenantContext.getSchemaName();

    // Set search_path to tenant schema
    await this.db.execute(
      sql.raw(`SET search_path TO "${schemaName}", public`),
    );

    try {
      return await fn();
    } finally {
      // Always reset search_path
      await this.db.execute(sql.raw('RESET search_path'));
    }
  }

  /**
   * Find all active records (exclude soft deleted)
   */
  async findAll(_filters?: Record<string, unknown>): Promise<T[]> {
    try {
      return await this.withTenantSchema(() =>
        this.db
          .select()
          .from(this.table)
          .where(isNull(this.table.deleted_at)),
      );
    } catch (error) {
      this.logger.error('Failed to find all records:', error);
      throw error;
    }
  }

  /**
   * Find record by ID (exclude soft deleted)
   */
  async findById(id: number): Promise<T | null> {
    try {
      return await this.withTenantSchema(async () => {
        const results = await this.db
          .select()
          .from(this.table)
          .where(and(eq(this.table.id, id), isNull(this.table.deleted_at)))
          .limit(1);

        return results[0] || null;
      });
    } catch (error) {
      this.logger.error(`Failed to find record by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new record with audit fields
   */
  async create(data: Partial<T>, userId?: number): Promise<T> {
    try {
      return await this.withTenantSchema(async () => {
        const results = (await this.db
          .insert(this.table)
          .values({
            ...data,
            created_by: userId ?? null,
            updated_by: userId ?? null,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning()) as T[];

        return results[0];
      });
    } catch (error) {
      this.logger.error('Failed to create record:', error);
      throw error;
    }
  }

  /**
   * Update record with audit fields
   */
  async update(id: number, data: Partial<T>, userId?: number): Promise<T> {
    try {
      return await this.withTenantSchema(async () => {
        const results = (await this.db
          .update(this.table)
          .set({
            ...data,
            updated_by: userId ?? null,
            updated_at: new Date(),
          })
          .where(and(eq(this.table.id, id), isNull(this.table.deleted_at)))
          .returning()) as T[];

        return results[0];
      });
    } catch (error) {
      this.logger.error(`Failed to update record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete record
   */
  async softDelete(id: number, userId?: number): Promise<void> {
    try {
      await this.withTenantSchema(() =>
        this.db
          .update(this.table)
          .set({
            deleted_at: new Date(),
            deleted_by: userId ?? null,
          })
          .where(eq(this.table.id, id)),
      );
    } catch (error) {
      this.logger.error(`Failed to soft delete record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Restore soft deleted record
   */
  async restore(id: number): Promise<void> {
    try {
      await this.withTenantSchema(() =>
        this.db
          .update(this.table)
          .set({
            deleted_at: null,
            deleted_by: null,
          })
          .where(eq(this.table.id, id)),
      );
    } catch (error) {
      this.logger.error(`Failed to restore record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Hard delete record (use with caution!)
   * This permanently removes the record from database
   */
  async hardDelete(id: number): Promise<void> {
    try {
      await this.withTenantSchema(() =>
        this.db.delete(this.table).where(eq(this.table.id, id)),
      );
    } catch (error) {
      this.logger.error(`Failed to hard delete record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find only deleted records
   */
  async findDeleted(): Promise<T[]> {
    try {
      return await this.withTenantSchema(() =>
        this.db
          .select()
          .from(this.table)
          .where(not(isNull(this.table.deleted_at))),
      );
    } catch (error) {
      this.logger.error('Failed to find deleted records:', error);
      throw error;
    }
  }

  /**
   * Count active records
   */
  async count(_filters?: Record<string, unknown>): Promise<number> {
    try {
      return await this.withTenantSchema(async () => {
        const results = await this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(this.table)
          .where(isNull(this.table.deleted_at));

        return results[0]?.count || 0;
      });
    } catch (error) {
      this.logger.error('Failed to count records:', error);
      throw error;
    }
  }

  /**
   * Find all with pagination
   */
  async findAllPaginated(
    _filters?: Record<string, unknown>,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 10 } = options || {};
    const offset = (page - 1) * pageSize;

    try {
      return await this.withTenantSchema(async () => {
        // Get total count
        const countResults = await this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(this.table)
          .where(isNull(this.table.deleted_at));

        const total = countResults[0]?.count || 0;

        // Get paginated data
        const data = await this.db
          .select()
          .from(this.table)
          .where(isNull(this.table.deleted_at))
          .limit(pageSize)
          .offset(offset);

        return {
          data,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      });
    } catch (error) {
      this.logger.error('Failed to find paginated records:', error);
      throw error;
    }
  }
}
