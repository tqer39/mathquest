import { describe, expect, it } from 'vitest';
import {
  generateQuestion,
  generateGradeOneQuestion,
  generateSingleOperationQuestion,
  generateInverseQuestion,
  generateSubtractionInverseQuestion,
  evaluateQuestion,
  checkAnswer,
  formatQuestion,
  pickOp,
  type Mode,
  type Question,
} from '../index';

describe('pickOp', () => {
  it('returns + for add mode', () => {
    expect(pickOp('add')).toBe('+');
  });

  it('returns - for sub mode', () => {
    expect(pickOp('sub')).toBe('-');
  });

  it('returns × for mul mode', () => {
    expect(pickOp('mul')).toBe('×');
  });

  it('returns + or - for add-sub-mix mode', () => {
    const ops = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ops.add(pickOp('add-sub-mix'));
    }
    expect(ops.size).toBeGreaterThan(1);
    ops.forEach((op) => {
      expect(['+', '-']).toContain(op);
    });
  });

  it('returns +, -, or × for mix mode', () => {
    const ops = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ops.add(pickOp('mix'));
    }
    expect(ops.size).toBeGreaterThan(1);
    ops.forEach((op) => {
      expect(['+', '-', '×']).toContain(op);
    });
  });
});

describe('evaluateQuestion', () => {
  it('evaluates simple addition', () => {
    expect(evaluateQuestion({ a: 5, b: 3, op: '+' })).toBe(8);
  });

  it('evaluates simple subtraction', () => {
    expect(evaluateQuestion({ a: 10, b: 4, op: '-' })).toBe(6);
  });

  it('evaluates simple multiplication', () => {
    expect(evaluateQuestion({ a: 6, b: 7, op: '×' })).toBe(42);
  });

  it('evaluates addition with extra steps', () => {
    expect(
      evaluateQuestion({
        a: 5,
        b: 3,
        op: '+',
        extras: [
          { op: '+', value: 2 },
          { op: '-', value: 1 },
        ],
      })
    ).toBe(9); // 5 + 3 + 2 - 1 = 9
  });

  it('evaluates subtraction with extra steps', () => {
    expect(
      evaluateQuestion({
        a: 10,
        b: 2,
        op: '-',
        extras: [{ op: '-', value: 3 }],
      })
    ).toBe(5); // 10 - 2 - 3 = 5
  });

  it('handles zero values', () => {
    expect(evaluateQuestion({ a: 0, b: 0, op: '+' })).toBe(0);
    expect(evaluateQuestion({ a: 5, b: 0, op: '+' })).toBe(5);
    expect(evaluateQuestion({ a: 5, b: 0, op: '-' })).toBe(5);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    const question: Question = { a: 5, b: 3, op: '+', answer: 8 };
    expect(checkAnswer(question, 8)).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    const question: Question = { a: 5, b: 3, op: '+', answer: 8 };
    expect(checkAnswer(question, 7)).toBe(false);
  });

  it('handles inverse questions', () => {
    const question: Question = {
      a: 5,
      b: 3,
      op: '+',
      answer: 5,
      isInverse: true,
      inverseSide: 'left',
    };
    expect(checkAnswer(question, 5)).toBe(true);
    expect(checkAnswer(question, 3)).toBe(false);
  });

  it('handles questions with extras', () => {
    const question: Question = {
      a: 5,
      b: 3,
      op: '+',
      extras: [{ op: '+', value: 2 }],
      answer: 10,
    };
    expect(checkAnswer(question, 10)).toBe(true);
    expect(checkAnswer(question, 8)).toBe(false);
  });
});

describe('formatQuestion', () => {
  it('formats simple addition', () => {
    expect(formatQuestion({ a: 5, b: 3, op: '+', answer: 8 })).toBe('5 + 3');
  });

  it('formats simple subtraction', () => {
    expect(formatQuestion({ a: 10, b: 4, op: '-', answer: 6 })).toBe('10 - 4');
  });

  it('formats multiplication with × symbol', () => {
    expect(formatQuestion({ a: 6, b: 7, op: '×', answer: 42 })).toBe('6 × 7');
  });

  it('formats questions with extras', () => {
    expect(
      formatQuestion({
        a: 5,
        b: 3,
        op: '+',
        extras: [
          { op: '+', value: 2 },
          { op: '-', value: 1 },
        ],
        answer: 9,
      })
    ).toBe('5 + 3 + 2 - 1');
  });

  it('formats left inverse addition', () => {
    const result = formatQuestion({
      a: 5,
      b: 3,
      op: '+',
      answer: 5,
      isInverse: true,
      inverseSide: 'left',
    });
    expect(result).toBe('? + 3 = 8');
  });

  it('formats right inverse addition', () => {
    const result = formatQuestion({
      a: 5,
      b: 3,
      op: '+',
      answer: 3,
      isInverse: true,
      inverseSide: 'right',
    });
    expect(result).toBe('5 + ? = 8');
  });

  it('formats left inverse subtraction', () => {
    const result = formatQuestion({
      a: 8,
      b: 3,
      op: '-',
      answer: 8,
      isInverse: true,
      inverseSide: 'left',
    });
    expect(result).toBe('? - 3 = 8');
  });

  it('formats right inverse subtraction', () => {
    const result = formatQuestion({
      a: 10,
      b: 3,
      op: '-',
      answer: 3,
      isInverse: true,
      inverseSide: 'right',
    });
    expect(result).toBe('10 - ? = 7');
  });
});

describe('generateQuestion', () => {
  it('generates addition questions within max', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'add', max: 10 });
      expect(q.op).toBe('+');
      expect(q.a).toBeGreaterThanOrEqual(0);
      expect(q.a).toBeLessThanOrEqual(10);
      expect(q.b).toBeGreaterThanOrEqual(0);
      expect(q.b).toBeLessThanOrEqual(10);
      expect(q.answer).toBe(q.a + q.b);
      expect(q.answer).toBeLessThanOrEqual(10);
    }
  });

  it('generates subtraction questions with non-negative results', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'sub', max: 10 });
      expect(q.op).toBe('-');
      expect(q.a).toBeGreaterThanOrEqual(q.b);
      expect(q.answer).toBe(q.a - q.b);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('generates multiplication questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'mul', max: 100 });
      expect(q.op).toBe('×');
      expect(q.answer).toBe(q.a * q.b);
    }
  });

  it('generates mixed operation questions', () => {
    const ops = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion({ mode: 'mix', max: 20 });
      ops.add(q.op);
    }
    expect(ops.size).toBeGreaterThan(1);
  });

  it('generates add-sub-mix questions (grade-1 style)', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'add-sub-mix', max: 10 });
      expect(['+', '-']).toContain(q.op);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
    }
  });

  it('generates inverse questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'add-inverse', max: 10 });
      expect(q.isInverse).toBe(true);
      expect(q.op).toBe('+');
      expect(['left', 'right']).toContain(q.inverseSide);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
    }
  });

  it('generates subtraction inverse questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'sub-inverse', max: 10 });
      expect(q.isInverse).toBe(true);
      expect(q.op).toBe('-');
      expect(['left', 'right']).toContain(q.inverseSide);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
    }
  });
});

describe('generateSingleOperationQuestion', () => {
  it('generates binary addition', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateSingleOperationQuestion('add', 10, 2);
      expect(q.op).toBe('+');
      expect(q.extras).toBeUndefined();
      expect(q.a + q.b).toBeLessThanOrEqual(10);
      expect(q.answer).toBe(q.a + q.b);
    }
  });

  it('generates binary subtraction', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateSingleOperationQuestion('sub', 10, 2);
      expect(q.op).toBe('-');
      expect(q.extras).toBeUndefined();
      expect(q.a).toBeGreaterThanOrEqual(q.b);
      expect(q.answer).toBe(q.a - q.b);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('generates ternary addition with extras', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateSingleOperationQuestion('add', 10, 3);
      expect(q.op).toBe('+');
      expect(q.extras).toBeDefined();
      expect(q.extras?.length).toBe(1);
      expect(q.extras?.[0].op).toBe('+');
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.answer).toBe(q.a + q.b + (q.extras?.[0].value ?? 0));
    }
  });

  it('generates ternary subtraction with extras', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateSingleOperationQuestion('sub', 10, 3);
      expect(q.op).toBe('-');
      expect(q.extras).toBeDefined();
      expect(q.extras?.length).toBe(1);
      expect(q.extras?.[0].op).toBe('-');
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBe(q.a - q.b - (q.extras?.[0].value ?? 0));
    }
  });
});

describe('generateGradeOneQuestion', () => {
  it('generates questions within max range', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateGradeOneQuestion(10);
      expect(['+', '-']).toContain(q.op);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
    }
  });

  it('generates only binary questions when terms=2', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateGradeOneQuestion(10, 2);
      expect(q.extras).toBeUndefined();
      expect(['+', '-']).toContain(q.op);
    }
  });

  it('generates ternary questions when terms=3', () => {
    let hasExtras = false;
    for (let i = 0; i < 50; i++) {
      const q = generateGradeOneQuestion(10, 3);
      if (q.extras && q.extras.length > 0) {
        hasExtras = true;
        expect(q.extras.length).toBeGreaterThan(0);
      }
    }
    expect(hasExtras).toBe(true);
  });

  it('generates mixed binary and ternary when terms=null', () => {
    let hasBinary = false;
    let hasTernary = false;
    for (let i = 0; i < 100; i++) {
      const q = generateGradeOneQuestion(10, null);
      if (!q.extras || q.extras.length === 0) {
        hasBinary = true;
      } else {
        hasTernary = true;
      }
    }
    expect(hasBinary).toBe(true);
    expect(hasTernary).toBe(true);
  });
});

describe('generateInverseQuestion', () => {
  it('generates valid binary inverse questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateInverseQuestion(10, 2);
      expect(q.op).toBe('+');
      expect(q.isInverse).toBe(true);
      expect(['left', 'right']).toContain(q.inverseSide);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.extras).toBeUndefined();

      // Verify the math
      if (q.inverseSide === 'left') {
        // ? + b = result, answer = result - b
        const result = q.answer + q.b;
        expect(result).toBeLessThanOrEqual(10);
      } else {
        // a + ? = result, answer = result - a
        const result = q.a + q.answer;
        expect(result).toBeLessThanOrEqual(10);
      }
    }
  });

  it('generates valid ternary inverse questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateInverseQuestion(10, 3);
      expect(q.op).toBe('+');
      expect(q.isInverse).toBe(true);
      expect(['left', 'right']).toContain(q.inverseSide);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.extras).toBeDefined();
      expect(q.extras?.length).toBeGreaterThan(0);
    }
  });
});

describe('generateSubtractionInverseQuestion', () => {
  it('generates valid binary subtraction inverse questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateSubtractionInverseQuestion(10, 2);
      expect(q.op).toBe('-');
      expect(q.isInverse).toBe(true);
      expect(['left', 'right']).toContain(q.inverseSide);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.extras).toBeUndefined();

      // Verify the math
      if (q.inverseSide === 'left') {
        // ? - b = result, answer = result + b
        expect(q.answer).toBeGreaterThanOrEqual(q.b);
      } else {
        // a - ? = result, answer = a - result
        expect(q.a).toBeGreaterThanOrEqual(q.answer);
      }
    }
  });

  it('generates valid ternary subtraction inverse questions', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateSubtractionInverseQuestion(10, 3);
      expect(q.op).toBe('-');
      expect(q.isInverse).toBe(true);
      expect(['left', 'right']).toContain(q.inverseSide);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.extras).toBeDefined();
      expect(q.extras?.length).toBeGreaterThan(0);
    }
  });
});

describe('Integration: Full question lifecycle', () => {
  it('generates and validates correct answers', () => {
    const modes: Mode[] = ['add', 'sub', 'mul', 'mix', 'add-sub-mix'];
    modes.forEach((mode) => {
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion({ mode, max: 20 });
        expect(checkAnswer(q, q.answer)).toBe(true);
        expect(checkAnswer(q, q.answer + 1)).toBe(false);
      }
    });
  });

  it('formats and evaluates consistently', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion({ mode: 'add', max: 10 });
      const formatted = formatQuestion(q);
      expect(formatted).toContain(String(q.a));
      expect(formatted).toContain(String(q.b));
      expect(evaluateQuestion(q)).toBe(q.answer);
    }
  });
});
