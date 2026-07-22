/**
 * Tenant Schema Backups Schema
 * Tracks schema backups for permanently deleted tenants with 15-day retention
 * Note: Foreign keys removed to avoid circular dependencies
 */

import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

export const tenantSchemaBackups = pgTable(
  'tenant_schema_backups',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    tenant_id: bigint('tenant_id', { mode: 'number' }).notNull(),
    tenant_name: varchar('tenant_name', { length: 255 }).notNull(),
    tenant_slug: varchar('tenant_slug', { length: 255 }).notNull(),
    schema_name: varchar('schema_name', { length: 255 }).notNull().unique(),
    backup_reason: varchar('backup_reason', { length: 100 }).default('tenant_hard_delete'),
    backup_size: varchar('backup_size', { length: 50 }),
    table_count: integer('table_count').default(0),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: bigint('created_by', { mode: 'number' }),
    restored_at: timestamp('restored_at', { withTimezone: true }),
    restored_by: bigint('restored_by', { mode: 'number' }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    deleted_by: bigint('deleted_by', { mode: 'number' }),
    metadata: jsonb('metadata'),
  }
);

export type TenantSchemaBackup = typeof tenantSchemaBackups.$inferSelect;
export type NewTenantSchemaBackup = typeof tenantSchemaBackups.$inferInsert;
