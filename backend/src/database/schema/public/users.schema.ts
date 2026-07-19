import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  boolean,
  bigint,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Users Table - PUBLIC SCHEMA
 * Stores ALL users (SuperAdmin + Tenant users)
 * Referenced by tenant_xxx.user_roles via FK
 */
export const users = pgTable(
  'users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password_hash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    avatar_url: varchar('avatar_url', { length: 500 }),
    is_active: boolean('is_active').notNull().default(true),
    is_verified: boolean('is_verified').notNull().default(false),
    last_login_at: timestamp('last_login_at', { withTimezone: true }),
    last_login_ip: varchar('last_login_ip', { length: 45 }),
    must_change_password: boolean('must_change_password')
      .notNull()
      .default(false),
    password_changed_at: timestamp('password_changed_at', {
      withTimezone: true,
    }),

    // Audit fields
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_by: bigint('created_by', { mode: 'number' }),
    updated_by: bigint('updated_by', { mode: 'number' }),

    // Soft delete fields
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    deleted_by: bigint('deleted_by', { mode: 'number' }),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('idx_users_email').on(table.email),
      isActiveIdx: index('idx_users_is_active').on(table.is_active),
      deletedAtIdx: index('idx_users_deleted_at').on(table.deleted_at),
      createdByIdx: index('idx_users_created_by').on(table.created_by),
    };
  },
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
