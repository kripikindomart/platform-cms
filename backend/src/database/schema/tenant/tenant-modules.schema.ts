import {
  pgTable,
  bigserial,
  bigint,
  boolean,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const tenantModules = pgTable(
  'tenant_modules',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    // Note: module_id references public.modules (cross-schema FK)
    // Cross-schema FK validation handled in application layer
    module_id: bigint('module_id', { mode: 'number' }).notNull(),
    is_enabled: boolean('is_enabled').notNull().default(true),
    config: text('config'), // JSONB stored as text, parsed in application
    enabled_at: timestamp('enabled_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    enabled_by: bigint('enabled_by', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
    disabled_at: timestamp('disabled_at', { withTimezone: true }),
    disabled_by: bigint('disabled_by', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
  },
  (table) => {
    return {
      moduleIdIdx: uniqueIndex('idx_tenant_modules_module_id').on(
        table.module_id,
      ),
      isEnabledIdx: index('idx_tenant_modules_is_enabled').on(
        table.is_enabled,
      ),
    };
  },
);

export type TenantModule = typeof tenantModules.$inferSelect;
export type NewTenantModule = typeof tenantModules.$inferInsert;
