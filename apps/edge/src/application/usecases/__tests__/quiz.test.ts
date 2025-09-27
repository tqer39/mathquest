import { describe, expect, it } from 'vitest';
import { generateQuizQuestion, verifyAnswer } from '../quiz';

describe('generateQuizQuestion', () => {
  it('respects provided mode and max', () => {
    const question = generateQuizQuestion({ mode: 'add', max: 10 });
    expect(question.op).toBe('+');
    expect(question.a).toBeLessThanOrEqual(10);
    expect(question.b).toBeLessThanOrEqual(10);
  });

  it('falls back to defaults when payload is empty', () => {
    const question = generateQuizQuestion();
    expect(['+', '-', '×']).toContain(question.op);
    expect(question.a).toBeLessThanOrEqual(20);
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
});
