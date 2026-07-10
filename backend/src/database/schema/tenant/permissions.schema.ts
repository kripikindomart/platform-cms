import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const permissions = pgTable(
  'permissions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    resource: varchar('resource', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    scope: varchar('scope', { length: 50 }).notNull(),
    description: text('description'),

    // Audit field
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      resourceIdx: index('idx_permissions_resource').on(table.resource),
      actionIdx: index('idx_permissions_action').on(table.action),
    };
  },
);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
