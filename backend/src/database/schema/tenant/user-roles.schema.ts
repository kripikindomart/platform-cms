import {
  pgTable,
  bigserial,
  bigint,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { roles } from './roles.schema';

export const userRoles = pgTable(
  'user_roles',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role_id: bigint('role_id', { mode: 'number' })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    assigned_at: timestamp('assigned_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    assigned_by: bigint('assigned_by', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
  },
  (table) => {
    return {
      userIdIdx: index('idx_user_roles_user_id').on(table.user_id),
      roleIdIdx: index('idx_user_roles_role_id').on(table.role_id),
      userRoleUniqueIdx: uniqueIndex('idx_user_roles_unique').on(
        table.user_id,
        table.role_id,
      ),
    };
  },
);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
