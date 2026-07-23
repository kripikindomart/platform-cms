import { pgTable, bigserial, varchar, text, boolean, timestamp, bigint, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { tenants } from './tenants.schema';

/**
 * Visual Modules Table (PUBLIC SCHEMA)
 * Global module definitions untuk Visual Module Builder
 * BERBEDA dari CLI generator (generated_modules)
 */
export const visualModules = pgTable('visual_modules', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Module identification
  moduleName: varchar('module_name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Module features
  isTenantIsolated: boolean('is_tenant_isolated').notNull().default(true),
  hasSoftDelete: boolean('has_soft_delete').notNull().default(true),
  hasAudit: boolean('has_audit').notNull().default(true),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, published, archived
  
  // Query configuration
  searchableFields: text('searchable_fields').array(),
  filterableFields: text('filterable_fields').array(),
  sortableFields: text('sortable_fields').array(),
  
  // Statistics
  fieldsCount: integer('fields_count').notNull().default(0),
  installCount: integer('install_count').notNull().default(0),
  
  // UI/UX Configuration (JSONB)
  uiConfig: text('ui_config').$type<string>().notNull().default('{"createFormType":"page","editFormType":"page"}'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: bigint('created_by', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: bigint('updated_by', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  
  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: bigint('deleted_by', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});

/**
 * Visual Module Fields Table
 * Field definitions untuk visual modules
 */
export const visualModuleFields = pgTable('visual_module_fields', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  moduleId: bigint('module_id', { mode: 'number' }).notNull().references(() => visualModules.id, { onDelete: 'cascade' }),
  
  // Field definition
  fieldName: varchar('field_name', { length: 100 }).notNull(),
  fieldLabel: varchar('field_label', { length: 255 }).notNull(),
  fieldType: varchar('field_type', { length: 50 }).notNull(),
  fieldLength: integer('field_length'),
  precision: integer('precision'),
  scale: integer('scale'),
  
  // Display configuration
  isVisibleInList: boolean('is_visible_in_list').notNull().default(true),
  
  // Constraints
  defaultValue: text('default_value'),
  
  // Order
  fieldOrder: integer('field_order').notNull().default(0),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Visual Module Installations Table
 * Tracks which modules are installed in which tenants
 */
export const visualModuleInstallations = pgTable('visual_module_installations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  moduleId: bigint('module_id', { mode: 'number' }).notNull().references(() => visualModules.id, { onDelete: 'cascade' }),
  tenantId: bigint('tenant_id', { mode: 'number' }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Installation metadata
  version: varchar('version', { length: 20 }).notNull().default('1.0.0'),
  isEnabled: boolean('is_enabled').notNull().default(true),
  
  // Customizations
  customConfig: text('custom_config').$type<string>().notNull().default('{}'),
  
  // Audit
  installedAt: timestamp('installed_at', { withTimezone: true }).notNull().defaultNow(),
  installedBy: bigint('installed_by', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type VisualModule = typeof visualModules.$inferSelect;
export type NewVisualModule = typeof visualModules.$inferInsert;

export type VisualModuleField = typeof visualModuleFields.$inferSelect;
export type NewVisualModuleField = typeof visualModuleFields.$inferInsert;

export type VisualModuleInstallation = typeof visualModuleInstallations.$inferSelect;
export type NewVisualModuleInstallation = typeof visualModuleInstallations.$inferInsert;
