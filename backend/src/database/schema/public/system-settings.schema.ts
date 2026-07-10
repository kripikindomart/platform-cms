import {
  pgTable,
  bigserial,
  varchar,
  text,
  boolean,
  bigint,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const systemSettings = pgTable(
  'system_settings',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: text('value'),
    type: varchar('type', { length: 50 }).notNull(),
    description: text('description'),
    is_public: boolean('is_public').notNull().default(false),

    // Audit fields
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_by: bigint('updated_by', { mode: 'number' }),
  },
  (table) => {
    return {
      keyIdx: uniqueIndex('idx_system_settings_key').on(table.key),
      isPublicIdx: index('idx_system_settings_is_public').on(table.is_public),
    };
  },
);

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
