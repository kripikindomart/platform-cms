import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

/**
 * Category entity
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),

  // Fields
  parent_id: integer('parent_id'),
  name: varchar('name', { length: 255 }),
  slug: varchar('slug', { length: 255 }),
  description: text('description'),
  type: varchar('type', { length: 255 }),
  order: integer('order'),

  // Audit fields
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_by: integer('created_by').notNull(),
  updated_by: integer('updated_by').notNull(),

  // Soft delete fields (MANDATORY)
  deleted_at: timestamp('deleted_at'),
  deleted_by: integer('deleted_by'),
});

// Infer types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
