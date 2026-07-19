import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from '../public/users.schema';

export const passwordResets = pgTable(
  'password_resets',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    used_at: timestamp('used_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('idx_password_resets_user_id').on(table.user_id),
      tokenIdx: uniqueIndex('idx_password_resets_token').on(table.token),
      expiresAtIdx: index('idx_password_resets_expires_at').on(
        table.expires_at,
      ),
    };
  },
);

export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;
