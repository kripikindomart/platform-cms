import { pgTable, bigserial, varchar, text, timestamp, bigint, boolean, jsonb } from 'drizzle-orm/pg-core';

/**
 * Setting entity (Public Schema)
 * Global application settings - NOT tenant-specific
 */
export const settings = pgTable('settings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),

  // Fields
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(), // JSONB for flexible configuration
  description: text('description'),
  is_encrypted: boolean('is_encrypted').default(false),

  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updated_by: bigint('updated_by', { mode: 'number' }),

  // NO soft delete for settings - settings should not be deleted, only updated
});

// Infer types
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
