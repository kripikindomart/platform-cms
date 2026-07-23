import { pgTable, bigserial, varchar, integer, boolean, timestamp, bigint, text } from 'drizzle-orm/pg-core';
import { generatedModules } from './generated-modules.schema';

/**
 * Generated Module Fields Table
 * Stores field definitions untuk setiap generated module
 */
export const generatedModuleFields = pgTable('generated_module_fields', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Module relationship
  moduleId: bigint('module_id', { mode: 'number' })
    .notNull()
    .references(() => generatedModules.id, { onDelete: 'cascade' }),
  
  // Field definition
  fieldName: varchar('field_name', { length: 100 }).notNull(),
  fieldType: varchar('field_type', { length: 50 }).notNull(), // string, text, integer, decimal, boolean, date, datetime, email, url, uuid, json, enum
  fieldLength: integer('field_length'), // for string/varchar
  precision: integer('precision'), // for decimal
  scale: integer('scale'), // for decimal
  
  // Constraints
  isRequired: boolean('is_required').notNull().default(false),
  isUnique: boolean('is_unique').notNull().default(false),
  defaultValue: text('default_value'),
  
  // Validations (JSON array)
  // Example: [{"type": "min", "value": 3}, {"type": "email"}]
  validations: text('validations').$type<string>().notNull().default('[]'),
  
  // Order
  fieldOrder: integer('field_order').notNull().default(0),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type GeneratedModuleField = typeof generatedModuleFields.$inferSelect;
export type NewGeneratedModuleField = typeof generatedModuleFields.$inferInsert;
