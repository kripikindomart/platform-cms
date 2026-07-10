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
 * Product entity
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),

  // Fields
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 0 }).notNull(),
  stock: integer('stock'),
  active: boolean('active').default(false),

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
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
