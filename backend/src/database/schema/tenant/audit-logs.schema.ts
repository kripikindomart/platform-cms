import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from '../public/users.schema';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
    action: varchar('action', { length: 50 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resource_id: bigint('resource_id', { mode: 'number' }),
    description: text('description'),
    old_values: text('old_values'), // JSONB stored as text
    new_values: text('new_values'), // JSONB stored as text
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('idx_audit_logs_user_id').on(table.user_id),
      actionIdx: index('idx_audit_logs_action').on(table.action),
      resourceIdx: index('idx_audit_logs_resource').on(table.resource),
      resourceIdIdx: index('idx_audit_logs_resource_id').on(table.resource_id),
      createdAtIdx: index('idx_audit_logs_created_at').on(table.created_at),
      resourceCompositeIdx: index('idx_audit_logs_resource_composite').on(
        table.resource,
        table.resource_id,
      ),
    };
  },
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
