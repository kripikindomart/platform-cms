import { pgTable, bigserial, varchar, text, boolean, timestamp, bigint, integer } from 'drizzle-orm/pg-core';

/**
 * Generated Modules Table
 * Stores metadata untuk module yang di-generate via CRUD Builder UI
 */
export const generatedModules = pgTable('generated_modules', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  tenantId: bigint('tenant_id', { mode: 'number' }).notNull(),
  
  // Module identification
  moduleName: varchar('module_name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Module features
  isTenantIsolated: boolean('is_tenant_isolated').notNull().default(true),
  hasSoftDelete: boolean('has_soft_delete').notNull().default(true),
  hasAudit: boolean('has_audit').notNull().default(true),
  visibility: varchar('visibility', { length: 20 }).notNull().default('private'), // private | public
  
  // Query configuration (array of field names)
  searchableFields: text('searchable_fields').array(),
  filterableFields: text('filterable_fields').array(),
  sortableFields: text('sortable_fields').array(),
  
  // Statistics
  fieldsCount: integer('fields_count').notNull().default(0),
  permissionsCount: integer('permissions_count').notNull().default(0),
  
  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: bigint('created_by', { mode: 'number' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: bigint('deleted_by', { mode: 'number' }),
});

export type GeneratedModule = typeof generatedModules.$inferSelect;
export type NewGeneratedModule = typeof generatedModules.$inferInsert;
