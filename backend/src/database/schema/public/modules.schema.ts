import {
  pgTable,
  bigserial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const modules = pgTable(
  'modules',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    display_name: varchar('display_name', { length: 255 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }),
    route_prefix: varchar('route_prefix', { length: 100 }).notNull().unique(),
    is_core: boolean('is_core').notNull().default(false),
    is_active: boolean('is_active').notNull().default(true),
    order: integer('order').notNull().default(0),
    version: varchar('version', { length: 20 }).notNull(),

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
      nameIdx: uniqueIndex('idx_modules_name').on(table.name),
      routePrefixIdx: uniqueIndex('idx_modules_route_prefix').on(
        table.route_prefix,
      ),
      isActiveIdx: index('idx_modules_is_active').on(table.is_active),
      isCoreIdx: index('idx_modules_is_core').on(table.is_core),
      orderIdx: index('idx_modules_order').on(table.order),
    };
  },
);

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
