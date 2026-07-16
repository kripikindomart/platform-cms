import { pgTable, bigserial, varchar, integer, boolean, timestamp, bigint, text } from 'drizzle-orm/pg-core';
import { menus } from './menus.schema';

/**
 * Menu Items Table - Individual menu items
 * Stores menu items with support for nested structure (parent_id)
 */
export const menuItems = pgTable('menu_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Menu group relationship
  menu_id: bigint('menu_id', { mode: 'number' })
    .notNull()
    .references(() => menus.id, { onDelete: 'cascade' }),
  
  // Parent relationship (for nested menus)
  parent_id: bigint('parent_id', { mode: 'number' }),
  
  // Module tracking
  module_name: varchar('module_name', { length: 100 }).notNull(),
  
  // Display info
  label: varchar('label', { length: 100 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  order: integer('order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  
  // Permission requirement
  required_permission: varchar('required_permission', { length: 100 }),
  
  // Additional metadata (JSON stored as text)
  metadata: text('metadata'), // { badge, description, external, target, etc }
  
  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
