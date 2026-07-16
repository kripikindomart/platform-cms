import { pgTable, bigserial, varchar, integer, boolean, timestamp, bigint, text } from 'drizzle-orm/pg-core';

/**
 * Menus Table - Menu groups/sections
 * Stores main menu sections like "Main Menu", "Settings", "Reports"
 */
export const menus = pgTable('menus', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  order: integer('order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  
  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
