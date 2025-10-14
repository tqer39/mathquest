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
    return generateInverseQuestion(config.max, config.terms);
  }

  // terms が指定されている場合（add, subモードのみ）
  if (config.terms === 2 || config.terms === 3) {
    if (config.mode === 'add' || config.mode === 'sub') {
      return generateSingleOperationQuestion(
        config.mode,
        config.max,
        config.terms
      );
    }
    // add, sub 以外のモードで terms が指定されている場合は従来通り
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

// たし算またはひき算のみの問題を生成（二項または三項）
export const generateSingleOperationQuestion = (
  mode: 'add' | 'sub',
  max: number,
  terms: 2 | 3
): Question => {
  const op = mode === 'add' ? '+' : '-';

  if (terms === 2) {
    // 二項演算
    let a: number;
    let b: number;
    if (mode === 'add') {
      a = randInt(max);
      b = clampIntInclusive(0, max - a);
    } else {
      a = randInt(max);
      b = clampIntInclusive(0, a);
    }
    const answer = evaluateQuestion({ a, b, op });
    return { a, b, op, answer };
  } else {
    // 三項演算（terms === 3）- 必ず3つの数を生成
    if (mode === 'add') {
      // たし算のみ: a + b + c （必ず3項）
      for (let attempt = 0; attempt < 20; attempt++) {
        // maxを3分割することを考慮
        const avgValue = Math.max(1, Math.floor(max / 3));
        const a = clampIntInclusive(1, avgValue);
        const b = clampIntInclusive(1, Math.max(1, max - a - 1));
        const remaining = max - (a + b);
        if (remaining >= 1) {
          const c = clampIntInclusive(1, remaining);
          const extras = [{ op: '+', value: c }] as const;
          const answer = evaluateQuestion({ a, b, op: '+', extras });
          if (answer >= 0 && answer <= max) {
            return { a, b, op: '+', extras, answer };
          }
        }
      }
      // フォールバック: 簡単な3項たし算
      const a = 1;
      const b = 1;
      const c = Math.min(1, max - 2);
      const extras = [{ op: '+', value: c }] as const;
      const answer = evaluateQuestion({ a, b, op: '+', extras });
      return { a, b, op: '+', extras, answer };
    } else {
      // ひき算のみ: a - b - c （必ず3項）
      // a >= b + c を保証する必要がある
      for (let attempt = 0; attempt < 20; attempt++) {
        const a = clampIntInclusive(3, max); // 最低3以上で2つ引ける
        const maxB = Math.max(1, Math.floor(a / 2));
        const b = clampIntInclusive(1, maxB);
        const afterB = a - b;
        const c = clampIntInclusive(1, Math.max(1, afterB - 1));
        const extras = [{ op: '-', value: c }] as const;
        const answer = evaluateQuestion({ a, b, op: '-', extras });
        if (answer >= 0 && answer <= max) {
          return { a, b, op: '-', extras, answer };
        }
      }
      // フォールバック: 簡単な3項ひき算
      const a = Math.max(3, max);
      const b = 1;
      const c = 1;
      const extras = [{ op: '-', value: c }] as const;
      const answer = a - b - c;
      return { a, b, op: '-', extras, answer };
    }
  }
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
    // extrasを考慮して正しい結果を計算
    let result =
      input.inverseSide === 'left'
        ? input.answer + input.b
        : input.a + input.answer;

    // extrasがある場合は、それも計算に含める
    if (input.extras && input.extras.length > 0) {
      result = input.extras.reduce((acc, step) => {
        return step.op === '+' ? acc + step.value : acc - step.value;
      }, result);
    }

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

export const generateInverseQuestion = (
  max: number,
  terms?: 2 | 3 | null
): Question => {
  // たし算の逆算問題を生成
  const result = randIntInclusive(1, max);
  const inverseSide = pick(['left', 'right'] as const);

  // 二項演算の逆算（デフォルト）
  if (!terms || terms === 2) {
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
  }

  // 三項演算の逆算: ? + b + c = result or a + ? + c = result
  for (let attempt = 0; attempt < 20; attempt++) {
    const resultValue = randIntInclusive(3, max);
    if (inverseSide === 'left') {
      // ? + b + c = result → 答えは result - b - c
      const b = randIntInclusive(1, Math.max(1, Math.floor(resultValue / 2)));
      const remaining = resultValue - b;
      if (remaining >= 2) {
        const c = randIntInclusive(1, remaining - 1);
        const answer = resultValue - b - c;
        if (answer >= 0 && answer <= max) {
          const extras = [{ op: '+', value: c }] as const;
          return {
            a: answer,
            b: b,
            op: '+',
            extras,
            answer: answer,
            isInverse: true,
            inverseSide: 'left',
          };
        }
      }
    } else {
      // a + ? + c = result → 答えは result - a - c
      const a = randIntInclusive(1, Math.max(1, Math.floor(resultValue / 2)));
      const remaining = resultValue - a;
      if (remaining >= 2) {
        const c = randIntInclusive(1, remaining - 1);
        const answer = resultValue - a - c;
        if (answer >= 0 && answer <= max) {
          const extras = [{ op: '+', value: c }] as const;
          return {
            a: a,
            b: answer,
            op: '+',
            extras,
            answer: answer,
            isInverse: true,
            inverseSide: 'right',
          };
        }
      }
    }
  }

  // フォールバック: 簡単な三項逆算
  if (inverseSide === 'left') {
    // ? + 1 + 1 = 3 → 答えは 1
    const b = 1;
    const c = 1;
    const answer = 1;
    const extras = [{ op: '+', value: c }] as const;
    return {
      a: answer,
      b: b,
      op: '+',
      extras,
      answer: answer,
      isInverse: true,
      inverseSide: 'left',
    };
  } else {
    // 1 + ? + 1 = 3 → 答えは 1
    const a = 1;
    const c = 1;
    const answer = 1;
    const extras = [{ op: '+', value: c }] as const;
    return {
      a: a,
      b: answer,
      op: '+',
      extras,
      answer: answer,
      isInverse: true,
      inverseSide: 'right',
    };
  }
};
