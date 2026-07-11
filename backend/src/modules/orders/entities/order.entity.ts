import { pgTable, serial, varchar, timestamp, integer, numeric } from 'drizzle-orm/pg-core';

/**
 * Order entity
 */
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),

  // Fields
  customer_name: varchar('customer_name', { length: 255 }),
  total: numeric('total', { precision: 10, scale: 2 }),
  order_date: timestamp('order_date'),
  status: varchar('status', { length: 50 }),

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
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
