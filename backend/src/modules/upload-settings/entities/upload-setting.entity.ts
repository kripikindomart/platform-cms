import { pgTable, serial, varchar, timestamp, integer, boolean, unique } from 'drizzle-orm/pg-core';

/**
 * UploadSetting entity
 * Stores URL format configuration for different file categories
 */
export const uploadSettings = pgTable('upload_settings', {
  id: serial('id').primaryKey(),

  // Configuration fields
  category: varchar('category', { length: 50 }).notNull(), // FileCategory enum
  url_format: varchar('url_format', { length: 50 }).notNull(), // GoogleDriveUrlFormat enum
  thumbnail_size: integer('thumbnail_size').default(200), // For THUMBNAIL format
  is_active: boolean('is_active').default(true).notNull(),

  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_by: integer('created_by'),
  updated_by: integer('updated_by'),

  // Soft delete fields (MANDATORY)
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: integer('deleted_by'),
}, (table) => ({
  // Unique constraint: one setting per category (excluding soft deleted)
  categoryUnique: unique('upload_settings_category_unique').on(table.category),
}));

// Infer types
export type UploadSetting = typeof uploadSettings.$inferSelect;
export type NewUploadSetting = typeof uploadSettings.$inferInsert;
