import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  username: text('username').unique(),
  email: text('email').unique(),
  password: text('password'),
  hashedRefreshToken: text('hashedRefreshToken'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type CreateUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
