import type { Mode, Question, ExtraStep } from '@mathquest/domain';
import {
  generateQuestion,
  evaluateQuestion,
  checkAnswer,
  generateGradeOneQuestion,
} from '@mathquest/domain';

export type GenerateQuizInput = {
  mode?: Mode;
  max?: number;
  gradeId?: string;
  terms?: 2 | 3 | null;
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const clauseAddQuestion = (values: number[], op: '+' | '-' = '+') => {
  if (values.length < 2) {
    const fallbackA = values[0] ?? 1;
    const fallbackBase = { a: fallbackA, b: 1, op };
    const answer = evaluateQuestion(fallbackBase);
    return { ...fallbackBase, extras: [] as ExtraStep[], answer };
  }
  const extras: ExtraStep[] = values
    .slice(2)
    .map((value) => ({ op: '+', value }));
  const base = {
    a: values[0],
    b: values[1],
    op,
    extras,
  } as const;
  const answer = evaluateQuestion(base);
  return { ...base, answer };
};

const generateAdditionMulti = (terms: number, max: number) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const values: number[] = [];
    for (let i = 0; i < terms; i += 1) {
      const upper = Math.max(1, Math.floor(max / terms));
      values.push(randomInt(1, upper));
    }
    const total = values.reduce((sum, value) => sum + value, 0);
    if (total <= max && total > 0) {
      return clauseAddQuestion(values);
    }
  }
  const baseValue = Math.max(1, Math.floor(max / terms));
  const fallback = new Array(terms).fill(baseValue);
  let total = fallback.reduce((sum, value) => sum + value, 0);
  let index = 0;
  while (total > max && index < fallback.length) {
    if (fallback[index] > 1) {
      fallback[index] -= 1;
      total -= 1;
    }
    index = (index + 1) % fallback.length;
    if (index === 0 && fallback.every((value) => value <= 1)) break;
  }
  if (fallback.reduce((sum, value) => sum + value, 0) <= 0) {
    fallback[0] = 1;
    fallback[1] = 1;
  }
  return clauseAddQuestion(fallback);
};

const generateOneDigitPlusTwoDigit = () => {
  const a = randomInt(1, 9);
  const b = randomInt(10, 99);
  const base = { a, b, op: '+' as const };
  const answer = evaluateQuestion(base);
  return { ...base, answer };
};

const generateDoubleDigitSubtraction = () => {
  let a = randomInt(10, 99);
  let b = randomInt(10, 99);
  if (b > a) [a, b] = [b, a];
  const base = { a, b, op: '-' as const };
  const answer = evaluateQuestion(base);
  return { ...base, answer };
};

const generateAddSubMix = (terms: number, max: number) => {
  const a = randomInt(5, Math.max(5, Math.floor(max / 2)));
  const b = randomInt(1, Math.max(1, Math.min(max - a, Math.floor(max / 2))));
  let current = a + b;
  const extras: ExtraStep[] = [];
  for (let i = 0; i < terms - 2; i += 1) {
    const ops: Array<'+' | '-'> = ['+', '-'];
    let op = ops[randomInt(0, ops.length - 1)];
    if (op === '+' && current >= max) {
      op = '-';
    }
    if (op === '-' && current <= 0) {
      op = '+';
    }
    if (op === '+') {
      const value = randomInt(1, Math.max(1, max - current));
      extras.push({ op: '+', value });
      current += value;
    } else {
      const value = randomInt(1, Math.max(1, current));
      extras.push({ op: '-', value });
      current -= value;
    }
  }
  const base = { a, b, op: '+' as const, extras };
  const answer = evaluateQuestion(base);
  return { ...base, answer };
};

export const generateQuizQuestion = (input: GenerateQuizInput = {}) => {
  const mode: Mode = input.mode ?? 'mix';
  const max = typeof input.max === 'number' && input.max > 0 ? input.max : 20;
  const terms = input.terms;

  if (input.gradeId === 'grade-1') {
    return generateGradeOneQuestion(max, terms);
  }
  switch (input.gradeId) {
    case 'practice-add-three':
      return generateAdditionMulti(3, max);
    case 'practice-add-four':
      return generateAdditionMulti(4, max);
    case 'practice-add-mixed-digits':
      return generateOneDigitPlusTwoDigit();
    case 'practice-sub-double-digit':
      return generateDoubleDigitSubtraction();
    case 'practice-mix-three':
      return generateAddSubMix(3, max);
    case 'practice-mix-four':
      return generateAddSubMix(4, max);
    default:
      break;
  }
  return generateQuestion({ mode, max, terms });
};

export type VerifyAnswerInput = {
  question: Pick<Question, 'a' | 'b' | 'op'> & {
    extras?: readonly ExtraStep[];
    isInverse?: boolean;
    inverseSide?: 'left' | 'right';
    answer?: number;
  };
  value: number;
};

export const verifyAnswer = ({ question, value }: VerifyAnswerInput) => {
  // 逆算問題の場合は、questionに含まれるanswerを使用
  let correctAnswer: number;
  if (question.isInverse && typeof question.answer === 'number') {
    correctAnswer = question.answer;
  } else {
    correctAnswer = evaluateQuestion(question);
  }
  const ok = checkAnswer({ ...question, answer: correctAnswer }, value);
  return { ok, correctAnswer };
};
