import { describe, expect, it } from 'vitest';
import { generateQuizQuestion, verifyAnswer } from '../quiz';

describe('generateQuizQuestion', () => {
  it('respects provided mode and max', () => {
    const question = generateQuizQuestion({ mode: 'add', max: 10 });
    expect(question.op).toBe('+');
    expect(question.a).toBeLessThanOrEqual(10);
    expect(question.b).toBeLessThanOrEqual(10);
    expect(question.a + question.b).toBeLessThanOrEqual(10);
  });

  it('keeps addition sums within max value', () => {
    const max = 10;
    for (let i = 0; i < 100; i += 1) {
      const question = generateQuizQuestion({ mode: 'add', max });
      expect(question.op).toBe('+');
      expect(question.a + question.b).toBeLessThanOrEqual(max);
    }
  });

  it('falls back to defaults when payload is empty', () => {
    const question = generateQuizQuestion();
    expect(['+', '-', '×']).toContain(question.op);
    expect(question.a).toBeLessThanOrEqual(20);
  });

  it('generates grade-1 specific variants within the allowed range', () => {
    const max = 10;
    for (let i = 0; i < 50; i += 1) {
      const question = generateQuizQuestion({
        gradeId: 'grade-1',
        mode: 'add',
        max,
      });
      expect(['+', '-']).toContain(question.op);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThanOrEqual(max);
      if (Array.isArray(question.extras)) {
        question.extras.forEach((step) => {
          expect(['+', '-']).toContain(step.op);
          expect(step.value).toBeGreaterThanOrEqual(0);
        });
      }
    }
  });
});

describe('verifyAnswer', () => {
  it('returns success when value matches computed answer', () => {
    const result = verifyAnswer({
      question: { a: 7, b: 5, op: '+' },
      value: 12,
    });
    expect(result).toEqual({ ok: true, correctAnswer: 12 });
  });

  it('returns failure when value is incorrect', () => {
    const result = verifyAnswer({
      question: { a: 9, b: 3, op: '×' },
      value: 20,
    });
    expect(result.ok).toBe(false);
    expect(result.correctAnswer).toBe(27);
  });

  it('handles questions that include additional steps', () => {
    const question = {
      a: 6,
      b: 2,
      op: '+',
      extras: [
        { op: '+', value: 1 },
        { op: '-', value: 3 },
      ],
    } as const;
    const success = verifyAnswer({ question, value: 6 });
    expect(success).toEqual({ ok: true, correctAnswer: 6 });
    const failure = verifyAnswer({ question, value: 5 });
    expect(failure.ok).toBe(false);
    expect(failure.correctAnswer).toBe(6);
  });
});
