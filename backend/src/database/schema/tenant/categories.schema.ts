import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const categories = pgTable(
  'categories',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    parent_id: bigint('parent_id', { mode: 'number' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 50 }).notNull(),
    order: integer('order').notNull().default(0),
    is_active: boolean('is_active').notNull().default(true),

    // Audit fields (MANDATORY)
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_by: bigint('created_by', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
    updated_by: bigint('updated_by', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),

    // Soft delete fields (MANDATORY)
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    deleted_by: bigint('deleted_by', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
  },
  (table) => {
    return {
      parentIdIdx: index('idx_categories_parent_id').on(table.parent_id),
      slugIdx: index('idx_categories_slug').on(table.slug),
      typeIdx: index('idx_categories_type').on(table.type),
      orderIdx: index('idx_categories_order').on(table.order),
      deletedAtIdx: index('idx_categories_deleted_at').on(table.deleted_at),
      slugTypeUniqueIdx: uniqueIndex('idx_categories_slug_type_unique').on(
        table.slug,
        table.type,
      ),
    };
  },
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
