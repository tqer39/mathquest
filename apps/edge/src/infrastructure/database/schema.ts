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
  answeredAt: text('answered_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;
