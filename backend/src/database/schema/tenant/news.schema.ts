import {
  pgTable,
  bigserial,
  varchar,
  text,
  integer,
  bigint,
  numeric,
  real,
  boolean,
  date,
  timestamp,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';

/**
 * news Schema
 * Auto-generated Drizzle schema
 * 
 * @generated
 */
export const news = pgTable('news', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),

  uuid: uuid('uuid'),
  title: varchar('title'),
  content: text('content'),
  image: varchar('image'),
  date: varchar('date'),

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at'),

  deleted_at: timestamp('deleted_at'),
});

// Type inference
export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
