import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { modules } from './modules.schema';

export const modulePermissions = pgTable(
  'module_permissions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    module_id: bigint('module_id', { mode: 'number' })
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
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
      moduleResourceActionScopeIdx: uniqueIndex(
        'idx_module_permissions_unique',
      ).on(table.module_id, table.resource, table.action, table.scope),
      moduleIdIdx: index('idx_module_permissions_module_id').on(
        table.module_id,
      ),
      resourceIdx: index('idx_module_permissions_resource').on(table.resource),
    };
  },
);

export type ModulePermission = typeof modulePermissions.$inferSelect;
export type NewModulePermission = typeof modulePermissions.$inferInsert;
