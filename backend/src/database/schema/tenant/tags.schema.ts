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

export const tags = pgTable(
  'tags',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    color: varchar('color', { length: 7 }), // Hex color code (#3B82F6)
    description: text('description'),
    usage_count: integer('usage_count').notNull().default(0),
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
      slugIdx: uniqueIndex('idx_tags_slug').on(table.slug),
      nameIdx: index('idx_tags_name').on(table.name),
      usageCountIdx: index('idx_tags_usage_count').on(table.usage_count),
      deletedAtIdx: index('idx_tags_deleted_at').on(table.deleted_at),
    };
  },
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
