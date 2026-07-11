import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

/**
 * Tag entity
 */
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),

  // Fields
  name: varchar('name', { length: 255 }),
  slug: varchar('slug', { length: 255 }),
  color: varchar('color', { length: 255 }),
  usage_count: integer('usage_count'),

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
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
