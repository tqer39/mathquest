import { Hono } from 'hono';
import type { Mode } from '@ed-games/domain';
import { generateQuestion, checkAnswer as check } from '@ed-games/domain';

export const quiz = new Hono();

quiz.post('/questions/next', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    mode?: Mode;
    max?: number;
  };
  const mode = body.mode ?? 'mix';
  const max = typeof body.max === 'number' ? body.max : 20;
  const question = generateQuestion({ mode, max });
  return c.json({ question });
});

quiz.post('/answers/check', async (c) => {
  const b = (await c.req.json()) as {
    a: number;
    b: number;
    op: '+' | '-' | '×';
    value: number;
  };
  const correct =
    b.op === '+' ? b.a + b.b : b.op === '-' ? b.a - b.b : b.a * b.b;
  const ok = check({ a: b.a, b: b.b, op: b.op, answer: correct }, b.value);
  return c.json({ ok, correctAnswer: correct });
});
