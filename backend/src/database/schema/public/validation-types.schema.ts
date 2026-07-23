import { pgTable, serial, bigserial, varchar, text, boolean, timestamp, integer, bigint } from 'drizzle-orm/pg-core';
import { visualModuleFields } from './visual-modules.schema';

/**
 * Validation Types Table (Master Data)
 * List of available validation types
 */
export const validationTypes = pgTable('validation_types', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  requiresValue: boolean('requires_value').notNull().default(false),
  valueType: varchar('value_type', { length: 20 }), // 'number', 'string', 'regex', 'json'
  applicableFieldTypes: text('applicable_field_types').array(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Visual Module Field Validations Table
 * Validation rules applied to visual module fields
 */
export const visualModuleFieldValidations = pgTable('visual_module_field_validations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  fieldId: bigint('field_id', { mode: 'number' }).notNull().references(() => visualModuleFields.id, { onDelete: 'cascade' }),
  validationTypeId: integer('validation_type_id').notNull().references(() => validationTypes.id, { onDelete: 'restrict' }),
  validationValue: text('validation_value'),
  errorMessage: text('error_message'),
  validationOrder: integer('validation_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ValidationType = typeof validationTypes.$inferSelect;
export type NewValidationType = typeof validationTypes.$inferInsert;

export type VisualModuleFieldValidation = typeof visualModuleFieldValidations.$inferSelect;
export type NewVisualModuleFieldValidation = typeof visualModuleFieldValidations.$inferInsert;
