import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const quizResults = sqliteTable('quiz_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gradeId: text('grade_id', { length: 32 }).notNull(),
  mode: text('mode', { length: 32 }).notNull(),
  maxValue: integer('max_value').notNull(),
  operandA: integer('operand_a').notNull(),
  operandB: integer('operand_b').notNull(),
  operator: text('operator', { length: 1 }).notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  userAnswer: integer('user_answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  expression: text('expression').notNull().default(''),
  extrasJson: text('extras_json').notNull().default('[]'),
  answeredAt: text('answered_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;

export const authUsers = sqliteTable('auth_users', {
  id: text('id', { length: 32 }).primaryKey(),
  email: text('email', { length: 255 }).notNull().unique(),
  displayName: text('display_name', { length: 120 }).notNull(),
  grade: text('grade', { length: 4 }).notNull(),
  avatarColor: text('avatar_color', { length: 16 }).notNull(),
  badgesJson: text('badges_json').notNull().default('[]'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const authSessions = sqliteTable('auth_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tokenHash: text('token_hash', { length: 128 }).notNull().unique(),
  userId: text('user_id', { length: 32 })
    .notNull()
    .references(() => authUsers.id),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const authLoginTokens = sqliteTable('auth_login_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email', { length: 255 }).notNull(),
  tokenHash: text('token_hash', { length: 128 }).notNull().unique(),
  redirectTo: text('redirect_to'),
  expiresAt: text('expires_at').notNull(),
  consumedAt: text('consumed_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type AuthUser = typeof authUsers.$inferSelect;
export type NewAuthUser = typeof authUsers.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type AuthLoginToken = typeof authLoginTokens.$inferSelect;
