import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, isNull, sql, and, lt } from 'drizzle-orm';
import * as publicSchema from '../../database/schema/public';
import { tenantSchemaBackups, NewTenantSchemaBackup, TenantSchemaBackup } from '../../database/schema/public';

@Injectable()
export class TenantSchemaBackupsRepository {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: NodePgDatabase<typeof publicSchema>,
  ) {}

  /**
   * Create schema backup record
   */
  async create(data: NewTenantSchemaBackup): Promise<TenantSchemaBackup> {
    const [backup] = await this.db
      .insert(tenantSchemaBackups)
      .values(data)
      .returning();
    return backup;
  }

  /**
   * Find backup by ID
   */
  async findById(id: number): Promise<TenantSchemaBackup | undefined> {
    const [backup] = await this.db
      .select()
      .from(tenantSchemaBackups)
      .where(and(
        eq(tenantSchemaBackups.id, id),
        isNull(tenantSchemaBackups.deleted_at)
      ));
    return backup;
  }

  /**
   * Find backup by schema name
   */
  async findBySchemaName(schemaName: string): Promise<TenantSchemaBackup | undefined> {
    const [backup] = await this.db
      .select()
      .from(tenantSchemaBackups)
      .where(and(
        eq(tenantSchemaBackups.schema_name, schemaName),
        isNull(tenantSchemaBackups.deleted_at)
      ));
    return backup;
  }

  /**
   * Find all active backups (not deleted, not expired)
   */
  async findAll(): Promise<TenantSchemaBackup[]> {
    return this.db
      .select()
      .from(tenantSchemaBackups)
      .where(and(
        isNull(tenantSchemaBackups.deleted_at),
        isNull(tenantSchemaBackups.restored_at)
      ))
      .orderBy(tenantSchemaBackups.created_at);
  }

  /**
   * Find expired backups (for cleanup)
   */
  async findExpired(): Promise<TenantSchemaBackup[]> {
    return this.db
      .select()
      .from(tenantSchemaBackups)
      .where(and(
        isNull(tenantSchemaBackups.deleted_at),
        isNull(tenantSchemaBackups.restored_at),
        lt(tenantSchemaBackups.expires_at, new Date())
      ));
  }

  /**
   * Mark backup as restored
   */
  async markRestored(id: number, restoredBy: number): Promise<TenantSchemaBackup> {
    const [backup] = await this.db
      .update(tenantSchemaBackups)
      .set({
        restored_at: new Date(),
        restored_by: restoredBy,
      })
      .where(eq(tenantSchemaBackups.id, id))
      .returning();
    return backup;
  }

  /**
   * Soft delete backup
   */
  async softDelete(id: number, deletedBy: number): Promise<void> {
    await this.db
      .update(tenantSchemaBackups)
      .set({
        deleted_at: new Date(),
        deleted_by: deletedBy,
      })
      .where(eq(tenantSchemaBackups.id, id));
  }

  /**
   * Hard delete backup record
   */
  async hardDelete(id: number): Promise<void> {
    await this.db
      .delete(tenantSchemaBackups)
      .where(eq(tenantSchemaBackups.id, id));
  }

  /**
   * Count active backups
   */
  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenantSchemaBackups)
      .where(and(
        isNull(tenantSchemaBackups.deleted_at),
        isNull(tenantSchemaBackups.restored_at)
      ));
    return result[0]?.count || 0;
  }
}
