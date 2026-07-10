/**
 * CLI Generator Metadata Schema
 * Tracks all generated modules, fields, and validations
 */

import { pgTable, serial, varchar, text, timestamp, integer, boolean, json, pgEnum } from 'drizzle-orm/pg-core';

/**
 * Field types enum
 */
export const fieldTypeEnum = pgEnum('field_type', [
  'string',
  'text',
  'number',
  'integer',
  'float',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'timestamp',
  'email',
  'url',
  'uuid',
  'json',
  'enum',
  'relation',
]);

/**
 * Input types for frontend (HTML input types + custom)
 */
export const inputTypeEnum = pgEnum('input_type', [
  'text',
  'textarea',
  'number',
  'email',
  'password',
  'url',
  'tel',
  'date',
  'datetime-local',
  'time',
  'checkbox',
  'radio',
  'select',
  'multiselect',
  'file',
  'image',
  'color',
  'range',
  'wysiwyg',
  'markdown',
  'json-editor',
  'relation-select',
]);

/**
 * Validation types
 */
export const validationTypeEnum = pgEnum('validation_type', [
  'required',
  'email',
  'url',
  'minLength',
  'maxLength',
  'pattern',
  'min',
  'max',
  'integer',
  'positive',
  'negative',
  'arrayMinLength',
  'arrayMaxLength',
  'custom',
]);

/**
 * Relation types enum
 */
export const relationTypeEnum = pgEnum('relation_type', [
  'one-to-one',
  'one-to-many',
  'many-to-one',
  'many-to-many',
]);

/**
 * Generated modules table
 * Tracks all modules created by CLI
 */
export const generatedModules = pgTable('generated_modules', {
  id: serial('id').primaryKey(),
  
  // Module info
  name: varchar('name', { length: 255 }).notNull().unique(), // e.g., "products"
  display_name: varchar('display_name', { length: 255 }), // e.g., "Products"
  description: text('description'),
  
  // Module configuration
  has_tenant_isolation: boolean('has_tenant_isolation').default(false).notNull(),
  has_soft_delete: boolean('has_soft_delete').default(false).notNull(),
  has_audit: boolean('has_audit').default(false).notNull(),
  
  // File paths (JSON array of generated files)
  generated_files: json('generated_files').$type<string[]>().notNull(),
  
  // CLI command used to generate
  cli_command: text('cli_command').notNull(),
  
  // Generation metadata
  generator_version: varchar('generator_version', { length: 50 }).notNull(),
  
  // Status
  is_active: boolean('is_active').default(true).notNull(),
  
  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: integer('created_by'), // User who ran CLI
  deleted_at: timestamp('deleted_at'), // For tracking deleted modules
});

/**
 * Module fields table
 * Tracks all fields in each module
 */
export const moduleFields = pgTable('module_fields', {
  id: serial('id').primaryKey(),
  
  // Reference to module
  module_id: integer('module_id').notNull().references(() => generatedModules.id, { onDelete: 'cascade' }),
  
  // Field info
  name: varchar('name', { length: 255 }).notNull(), // e.g., "price"
  display_name: varchar('display_name', { length: 255 }), // e.g., "Price"
  description: text('description'),
  
  // Field type (for database)
  field_type: fieldTypeEnum('field_type').notNull(),
  
  // Field constraints
  is_required: boolean('is_required').default(false).notNull(),
  is_unique: boolean('is_unique').default(false).notNull(),
  is_nullable: boolean('is_nullable').default(true).notNull(),
  default_value: text('default_value'),
  
  // String/numeric constraints
  length: integer('length'), // For varchar
  min_value: integer('min_value'), // For numbers
  max_value: integer('max_value'), // For numbers
  precision: integer('precision'), // For decimals
  scale: integer('scale'), // For decimals
  
  // Enum values (if field_type = 'enum')
  enum_values: json('enum_values').$type<string[]>(),
  
  // Relation info (if field_type = 'relation')
  relation_module: varchar('relation_module', { length: 255 }),
  relation_type: relationTypeEnum('relation_type'), // Use enum instead of varchar
  
  // Frontend info
  input_type: inputTypeEnum('input_type').notNull(),
  placeholder: varchar('placeholder', { length: 255 }),
  help_text: text('help_text'),
  
  // Display settings
  is_searchable: boolean('is_searchable').default(false).notNull(),
  is_sortable: boolean('is_sortable').default(false).notNull(),
  is_filterable: boolean('is_filterable').default(false).notNull(),
  show_in_list: boolean('show_in_list').default(true).notNull(),
  show_in_detail: boolean('show_in_detail').default(true).notNull(),
  show_in_form: boolean('show_in_form').default(true).notNull(),
  
  // Order
  order: integer('order').default(0).notNull(),
  
  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Field validations table
 * Tracks validation rules for each field
 */
export const fieldValidations = pgTable('field_validations', {
  id: serial('id').primaryKey(),
  
  // Reference to field
  field_id: integer('field_id').notNull().references(() => moduleFields.id, { onDelete: 'cascade' }),
  
  // Validation info
  validation_type: validationTypeEnum('validation_type').notNull(),
  
  // Validation parameters (stored as JSON for flexibility)
  // Examples:
  // - { value: 10 } for min/max
  // - { pattern: "^[A-Z]" } for regex
  // - { message: "Custom error" } for custom
  validation_params: json('validation_params').$type<Record<string, unknown>>(),
  
  // Error message
  error_message: text('error_message'),
  
  // Order (for multiple validations on same field)
  order: integer('order').default(0).notNull(),
  
  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Generation history table
 * Audit trail for all CLI operations
 */
export const generationHistory = pgTable('generation_history', {
  id: serial('id').primaryKey(),
  
  // Operation info
  operation: varchar('operation', { length: 50 }).notNull(), // 'generate', 'update', 'delete'
  module_id: integer('module_id').references(() => generatedModules.id, { onDelete: 'set null' }),
  
  // Command details
  command: text('command').notNull(),
  options: json('options').$type<Record<string, unknown>>(),
  
  // Result
  success: boolean('success').notNull(),
  error_message: text('error_message'),
  
  // Files affected
  files_created: json('files_created').$type<string[]>(),
  files_modified: json('files_modified').$type<string[]>(),
  files_deleted: json('files_deleted').$type<string[]>(),
  
  // Rollback info (for undo)
  can_rollback: boolean('can_rollback').default(true).notNull(),
  rollback_data: json('rollback_data').$type<Record<string, unknown>>(), // Backup of deleted files
  
  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: integer('created_by'),
});

// Type exports
export type GeneratedModule = typeof generatedModules.$inferSelect;
export type NewGeneratedModule = typeof generatedModules.$inferInsert;
export type ModuleField = typeof moduleFields.$inferSelect;
export type NewModuleField = typeof moduleFields.$inferInsert;
export type FieldValidation = typeof fieldValidations.$inferSelect;
export type NewFieldValidation = typeof fieldValidations.$inferInsert;
export type GenerationHistory = typeof generationHistory.$inferSelect;
export type NewGenerationHistory = typeof generationHistory.$inferInsert;
