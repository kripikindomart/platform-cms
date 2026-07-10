import {
  pgTable,
  varchar,
  bigint,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    payload: text('payload').notNull(), // JSONB stored as text
    last_activity: timestamp('last_activity', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('idx_sessions_user_id').on(table.user_id),
      lastActivityIdx: index('idx_sessions_last_activity').on(
        table.last_activity,
      ),
      expiresAtIdx: index('idx_sessions_expires_at').on(table.expires_at),
    };
  },
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
