import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  boolean,
  bigint,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * User Preferences Table - PUBLIC SCHEMA
 * Stores user-specific preferences and settings
 */
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Single Tenant Mode Settings
    is_single_tenant_mode: boolean('is_single_tenant_mode')
      .notNull()
      .default(false), // If true, auto-redirect to default tenant
    default_tenant_id: bigint('default_tenant_id', { mode: 'number' }), // FK to tenants table
    skip_org_selection: boolean('skip_org_selection').notNull().default(false), // Skip /organizations page
    show_org_switcher: boolean('show_org_switcher').notNull().default(true), // Show tenant switcher in header

    // UI/UX Preferences
    theme: varchar('theme', { length: 20 }).default('light'), // 'light', 'dark', 'auto'
    language: varchar('language', { length: 10 }).default('id'), // 'id', 'en'
    timezone: varchar('timezone', { length: 50 }).default('Asia/Jakarta'),
    
    // Notification Preferences
    email_notifications: boolean('email_notifications').notNull().default(true),
    push_notifications: boolean('push_notifications').notNull().default(true),
    notification_settings: jsonb('notification_settings'), // Custom notification rules

    // Additional Settings (flexible JSON)
    additional_settings: jsonb('additional_settings'),

    // Audit fields
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('idx_user_preferences_user_id').on(table.user_id),
      singleTenantIdx: index('idx_user_preferences_single_tenant').on(
        table.is_single_tenant_mode,
      ),
      defaultTenantIdx: index('idx_user_preferences_default_tenant').on(
        table.default_tenant_id,
      ),
    };
  },
);

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
