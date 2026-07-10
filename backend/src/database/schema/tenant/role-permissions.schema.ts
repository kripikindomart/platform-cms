import {
  pgTable,
  bigserial,
  bigint,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { roles } from './roles.schema';
import { permissions } from './permissions.schema';
import { users } from './users.schema';

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    role_id: bigint('role_id', { mode: 'number' })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission_id: bigint('permission_id', { mode: 'number' })
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
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
      roleIdIdx: index('idx_role_permissions_role_id').on(table.role_id),
      permissionIdIdx: index('idx_role_permissions_permission_id').on(
        table.permission_id,
      ),
      rolePermissionUniqueIdx: uniqueIndex('idx_role_permissions_unique').on(
        table.role_id,
        table.permission_id,
      ),
    };
  },
);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
