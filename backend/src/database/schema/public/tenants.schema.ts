import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  boolean,
  bigint,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const tenants = pgTable(
  'tenants',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    domain: varchar('domain', { length: 255 }),
    schema_name: varchar('schema_name', { length: 100 }).notNull().unique(),
    logo_url: varchar('logo_url', { length: 500 }),
    primary_color: varchar('primary_color', { length: 7 }).default('#6366f1'),
    secondary_color: varchar('secondary_color', { length: 7 }).default('#8b5cf6'),
    subscription_tier: varchar('subscription_tier', { length: 50 })
      .notNull()
      .default('free'),
    subscription_expires_at: timestamp('subscription_expires_at', {
      withTimezone: true,
    }),
    config: text('config'), // JSONB stored as text
    is_active: boolean('is_active').notNull().default(true),

    // Audit fields
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_by: bigint('created_by', { mode: 'number' }),
    updated_by: bigint('updated_by', { mode: 'number' }),

    // Soft delete
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    deleted_by: bigint('deleted_by', { mode: 'number' }),
  },
  (table) => {
    return {
      slugIdx: uniqueIndex('idx_tenants_slug').on(table.slug),
      domainIdx: uniqueIndex('idx_tenants_domain').on(table.domain),
      isActiveIdx: index('idx_tenants_is_active').on(table.is_active),
      deletedAtIdx: index('idx_tenants_deleted_at').on(table.deleted_at),
    };
  },
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
