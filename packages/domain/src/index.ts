export type Mode =
  | 'add'
  | 'sub'
  | 'mul'
  | 'add-sub-mix'
  | 'mix'
  | 'add-inverse';

export type QuizConfig = {
  mode: Mode;
  max: number;
  terms?: 2 | 3 | null; // 2: 二項のみ, 3: 三項のみ, null: 混在
};

export type ExtraStep = {
  op: '+' | '-';
  value: number;
};

export type Question = {
  a: number;
  b: number;
  op: '+' | '-' | '×';
  extras?: readonly ExtraStep[];
  answer: number;
  isInverse?: boolean;
  inverseSide?: 'left' | 'right';
};

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randInt = (n: number) => Math.floor(Math.random() * (n + 1));
const randIntInclusive = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const clampIntInclusive = (min: number, max: number) => {
  if (max < min) return min;
  return randIntInclusive(min, max);
};

export const pickOp = (mode: Mode): Question['op'] => {
  if (mode === 'mix') return pick(['+', '-', '×'] as const);
  if (mode === 'add-sub-mix') return pick(['+', '-'] as const);
  if (mode === 'add') return '+';
  if (mode === 'sub') return '-';
  return '×';
};

export const generateQuestion = (config: QuizConfig): Question => {
  // add-sub-mix モードの場合は、複数ステップの問題を生成
  if (config.mode === 'add-sub-mix') {
    return generateGradeOneQuestion(config.max, config.terms);
  }

  // add-inverse モードの場合は、逆算問題を生成
  if (config.mode === 'add-inverse') {
    return generateInverseQuestion(config.max);
  }

  // terms が指定されている場合は、それに応じて生成
  if (config.terms === 2 || config.terms === 3) {
    return generateGradeOneQuestion(config.max, config.terms);
  }

  const op = pickOp(config.mode);
  let a: number;
  let b: number;

  if (op === '+') {
    a = randInt(config.max);
    b = randIntInclusive(0, config.max - a);
  } else if (op === '-') {
    a = randInt(config.max);
    b = randInt(config.max);
    if (b > a) [a, b] = [b, a];
  } else if (op === '×') {
    const upper = Math.max(10, Math.floor(config.max / 2));
    a = randInt(upper);
    b = randInt(upper);
  } else {
    a = randInt(config.max);
    b = randInt(config.max);
  }

  const answer = evaluateQuestion({ a, b, op });
  return { a, b, op, answer };
};

const normalizeExtras = (
  extras?: ExtraStep[]
): readonly ExtraStep[] | undefined =>
  extras && extras.length > 0 ? extras.map((step) => ({ ...step })) : undefined;

const ensureMin = (value: number, min: number) => (value < min ? min : value);

const pickNonZero = (min: number, max: number) => {
  const upper = Math.max(min, max);
  if (upper <= 0) return 0;
  const from = ensureMin(min, 1);
  return clampIntInclusive(from, upper);
};

const finalizeGradeOneQuestion = (params: {
  a: number;
  b: number;
  op: '+' | '-';
  extras?: ExtraStep[];
}): Question => {
  const extras = normalizeExtras(params.extras);
  const answer = evaluateQuestion({
    a: params.a,
    b: params.b,
    op: params.op,
    extras,
  });
  return {
    a: params.a,
    b: params.b,
    op: params.op,
    extras,
    answer,
  };
};

export const generateGradeOneQuestion = (
  max: number,
  terms?: 2 | 3 | null
): Question => {
  // 二項演算のパターン
  const binaryPatterns = [
    () => {
      const a = randInt(max);
      const b = clampIntInclusive(0, max - a);
      return finalizeGradeOneQuestion({ a, b, op: '+' });
    },
    () => {
      const a = randInt(max);
      const b = clampIntInclusive(0, a);
      return finalizeGradeOneQuestion({ a, b, op: '-' });
    },
  ];

  // 三項演算のパターン
  const ternaryPatterns = [
    () => {
      const a = randInt(max);
      const b = clampIntInclusive(0, max - a);
      const remaining = Math.max(0, max - (a + b));
      const c = remaining > 0 ? pickNonZero(0, remaining) : 0;
      return finalizeGradeOneQuestion({
        a,
        b,
        op: '+',
        extras: c > 0 ? [{ op: '+', value: c }] : undefined,
      });
    },
    () => {
      const a = randInt(max);
      const b = clampIntInclusive(0, max - a);
      const total = a + b;
      const c = total > 0 ? pickNonZero(0, total) : 0;
      return finalizeGradeOneQuestion({
        a,
        b,
        op: '+',
        extras: c > 0 ? [{ op: '-', value: c }] : undefined,
      });
    },
    () => {
      const a = randInt(max);
      const b = clampIntInclusive(0, a);
      const after = a - b;
      const c = pickNonZero(0, Math.max(0, max - after));
      return finalizeGradeOneQuestion({
        a,
        b,
        op: '-',
        extras: c > 0 ? [{ op: '+', value: c }] : undefined,
      });
    },
    () => {
      const a = randInt(max);
      const b = clampIntInclusive(0, max - a);
      const sum = a + b;
      const remaining = Math.max(0, max - sum);
      const c = remaining > 0 ? pickNonZero(0, remaining) : 0;
      const maxSubtract = sum + (c > 0 ? c : 0);
      const d = maxSubtract > 0 ? pickNonZero(0, maxSubtract) : 0;
      const extras: ExtraStep[] = [];
      if (c > 0) extras.push({ op: '+', value: c });
      if (d > 0) extras.push({ op: '-', value: d });
      return finalizeGradeOneQuestion({
        a,
        b,
        op: '+',
        extras: extras.length > 0 ? extras : undefined,
      });
    },
  ];

  // terms に基づいてパターンを選択
  let patterns: Array<() => Question>;
  if (terms === 2) {
    patterns = binaryPatterns;
  } else if (terms === 3) {
    patterns = ternaryPatterns;
  } else {
    // null または未指定の場合は両方を混在
    patterns = [...binaryPatterns, ...ternaryPatterns];
  }

  let question: Question | null = null;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = pick(patterns)();
    const answer = candidate.answer;
    if (answer >= 0 && answer <= max) {
      question = candidate;
      break;
    }
  }

  if (!question) {
    const fallbackA = randInt(max);
    const fallbackB = clampIntInclusive(0, max - fallbackA);
    question = finalizeGradeOneQuestion({
      a: fallbackA,
      b: fallbackB,
      op: '+',
    });
  }

  return question;
};

export const checkAnswer = (q: Question, input: number) => {
  // 逆算問題の場合は、answerフィールドが正解
  if (q.isInverse) {
    return input === q.answer;
  }
  // 通常の問題の場合も、answerフィールドが正解
  return input === q.answer;
};

export const evaluateQuestion = (
  input: Pick<Question, 'a' | 'b' | 'op'> & { extras?: readonly ExtraStep[] }
) => {
  let result =
    input.op === '+'
      ? input.a + input.b
      : input.op === '-'
        ? input.a - input.b
        : input.a * input.b;

  if (input.extras && input.extras.length > 0) {
    result = input.extras.reduce((acc, step) => {
      return step.op === '+' ? acc + step.value : acc - step.value;
    }, result);
  }

  return result;
};

export const formatQuestion = (
  input: Pick<Question, 'a' | 'b' | 'op' | 'answer'> & {
    extras?: readonly ExtraStep[];
    isInverse?: boolean;
    inverseSide?: 'left' | 'right';
  }
) => {
  if (input.isInverse && input.inverseSide) {
    const parts = [];
    if (input.inverseSide === 'left') {
      parts.push('?', input.op === '×' ? '×' : input.op, `${input.b}`);
    } else {
      parts.push(`${input.a}`, input.op === '×' ? '×' : input.op, '?');
    }
    if (input.extras && input.extras.length > 0) {
      input.extras.forEach((step) => {
        parts.push(step.op, String(step.value));
      });
    }
    // 逆算問題では結果も表示
    const result =
      input.inverseSide === 'left'
        ? input.answer + input.b
        : input.a + input.answer;
    parts.push('=', `${result}`);
    return parts.join(' ');
  }

  const parts = [`${input.a}`, input.op === '×' ? '×' : input.op, `${input.b}`];
  if (input.extras && input.extras.length > 0) {
    input.extras.forEach((step) => {
      parts.push(step.op, String(step.value));
    });
  }
  return parts.join(' ');
};

export const generateInverseQuestion = (max: number): Question => {
  // たし算の逆算問題を生成
  // 例: ? + 5 = 10 → 答えは 5
  const result = randIntInclusive(1, max);
  const inverseSide = pick(['left', 'right'] as const);

  if (inverseSide === 'left') {
    // ? + b = result → 答えは result - b
    const b = randIntInclusive(0, result);
    const answer = result - b;
    return {
      a: answer,
      b: b,
      op: '+',
      answer: answer,
      isInverse: true,
      inverseSide: 'left',
    };
  } else {
    // a + ? = result → 答えは result - a
    const a = randIntInclusive(0, result);
    const answer = result - a;
    return {
      a: a,
      b: answer,
      op: '+',
      answer: answer,
      isInverse: true,
      inverseSide: 'right',
    };
  }
};
