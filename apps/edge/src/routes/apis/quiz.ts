import { Hono } from 'hono';
import type { Mode } from '@mathquest/domain';
import {
  generateQuizQuestion,
  verifyAnswer,
} from '../../application/usecases/quiz';

export const quiz = new Hono();

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
  };
  const { ok, correctAnswer } = verifyAnswer({
    question: { a: payload.a, b: payload.b, op: payload.op },
    value: payload.value,
  });
  return c.json({ ok, correctAnswer });
});
