import { Hono } from 'hono';
import type { Mode } from '@mathquest/domain';
import type { Env } from '../../env';
import {
  generateQuizQuestion,
  verifyAnswer,
} from '../../application/usecases/quiz';
import { createDb, schema } from '../../infrastructure/database/client';

export const quiz = new Hono<{ Bindings: Env }>();

quiz.post('/questions/next', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    mode?: Mode;
    max?: number;
  };
  const question = generateQuizQuestion({ mode: body.mode, max: body.max });
  return c.json({ question });
});

quiz.post('/answers/check', async (c) => {
  const payload = (await c.req.json()) as {
    a: number;
    b: number;
    op: '+' | '-' | '×';
    value: number;
    gradeId?: string;
    mode?: Mode;
    max?: number;
  };
  const { ok, correctAnswer } = verifyAnswer({
    question: { a: payload.a, b: payload.b, op: payload.op },
    value: payload.value,
  });

  const db = createDb(c.env);
  try {
    await db.insert(schema.quizResults).values({
      gradeId: payload.gradeId ?? 'unknown',
      mode: payload.mode ?? 'mix',
      maxValue: typeof payload.max === 'number' ? payload.max : 0,
      operandA: payload.a,
      operandB: payload.b,
      operator: payload.op,
      correctAnswer,
      userAnswer: payload.value,
      isCorrect: ok,
    });
  } catch (error) {
    console.error('failed to persist quiz result', error);
  }
  return c.json({ ok, correctAnswer });
});
