import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  username: text('username').unique(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  hashedRefreshToken: text('hashedRefreshToken'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type CreateUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
