import { Hono } from 'hono';
import type { ExtraStep, Mode } from '@mathquest/domain';
import { formatQuestion } from '@mathquest/domain';
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
    gradeId?: string;
    terms?: 2 | 3 | null;
  };
  const question = generateQuizQuestion({
    mode: body.mode,
    max: body.max,
    gradeId: body.gradeId,
    terms: body.terms,
  });
  const expression = formatQuestion(question);
  return c.json({ question: { ...question, expression } });
});

quiz.post('/answers/check', async (c) => {
  const payload = (await c.req.json()) as {
    question?: {
      a: number;
      b: number;
      op: '+' | '-' | '×';
      extras?: ExtraStep[];
      isInverse?: boolean;
      inverseSide?: 'left' | 'right';
      answer?: number;
    };
    a?: number;
    b?: number;
    op?: '+' | '-' | '×';
    extras?: ExtraStep[];
    value: number;
    gradeId?: string;
    mode?: Mode;
    max?: number;
  };
  const baseQuestion = payload.question ?? {
    a: payload.a,
    b: payload.b,
    op: payload.op,
    extras: payload.extras,
  };

  if (
    !baseQuestion ||
    typeof baseQuestion.a !== 'number' ||
    typeof baseQuestion.b !== 'number' ||
    (baseQuestion.op !== '+' &&
      baseQuestion.op !== '-' &&
      baseQuestion.op !== '×') ||
    typeof payload.value !== 'number'
  ) {
    return c.json({ error: 'invalid payload' }, 400);
  }

  const extras = Array.isArray(baseQuestion.extras)
    ? baseQuestion.extras.filter(
        (step) =>
          step &&
          typeof step.value === 'number' &&
          (step.op === '+' || step.op === '-')
      )
    : undefined;

  const isInverse =
    'isInverse' in baseQuestion ? baseQuestion.isInverse : undefined;
  const inverseSide =
    'inverseSide' in baseQuestion ? baseQuestion.inverseSide : undefined;
  const providedAnswer =
    'answer' in baseQuestion ? baseQuestion.answer : undefined;

  const questionForCheck = {
    a: baseQuestion.a,
    b: baseQuestion.b,
    op: baseQuestion.op,
    extras,
    isInverse,
    inverseSide,
    answer: providedAnswer,
  };

  const { ok, correctAnswer } = verifyAnswer({
    question: questionForCheck,
    value: payload.value,
  });

  // formatQuestionはanswerが必須なので、correctAnswerを使用
  const expression = formatQuestion({
    a: baseQuestion.a,
    b: baseQuestion.b,
    op: baseQuestion.op,
    extras,
    isInverse,
    inverseSide,
    answer: correctAnswer,
  });

  const db = createDb(c.env);
  try {
    await db.insert(schema.quizResults).values({
      gradeId: payload.gradeId ?? 'unknown',
      mode: payload.mode ?? 'mix',
      maxValue: typeof payload.max === 'number' ? payload.max : 0,
      operandA: questionForCheck.a,
      operandB: questionForCheck.b,
      operator: questionForCheck.op,
      correctAnswer,
      userAnswer: payload.value,
      isCorrect: ok,
      expression,
      extrasJson: JSON.stringify(extras ?? []),
    });
  } catch (error) {
    console.error('failed to persist quiz result', error);
  }
  return c.json({ ok, correctAnswer });
});
