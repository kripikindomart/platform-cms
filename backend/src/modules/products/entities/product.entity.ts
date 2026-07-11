import { pgTable, serial, timestamp, integer, bigint } from 'drizzle-orm/pg-core';

/**
 * Product entity
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),

  // TODO: Add your fields here
  // Example:
  // name: varchar('name', { length: 255 }).notNull(),
  // description: text('description'),
  // is_active: boolean('is_active').default(true).notNull(),

  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete fields
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

// Infer types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
