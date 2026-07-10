import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  boolean,
  bigint,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const roles = pgTable(
  'roles',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    display_name: varchar('display_name', { length: 255 }).notNull(),
    description: text('description'),
    is_system: boolean('is_system').notNull().default(false),
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
      nameIdx: uniqueIndex('idx_roles_name').on(table.name),
      isActiveIdx: index('idx_roles_is_active').on(table.is_active),
      isSystemIdx: index('idx_roles_is_system').on(table.is_system),
      deletedAtIdx: index('idx_roles_deleted_at').on(table.deleted_at),
    };
  },
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
