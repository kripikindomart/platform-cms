import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  uuid,
  json,
} from 'drizzle-orm/pg-core';

/**
 * Post entity
 */
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),

  // Fields
  title: varchar('title', { length: 255 }),
  slug: varchar('slug', { length: 255 }),
  content: text('content'),
  status: varchar('status', { length: 255 }),
  published_at: timestamp('published_at'),

  // Audit fields
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_by: integer('created_by').notNull(),
  updated_by: integer('updated_by').notNull(),

  // Soft delete fields
  deleted_at: timestamp('deleted_at'),
  deleted_by: integer('deleted_by'),
});

// Infer types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
