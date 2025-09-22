export type Mode = 'add' | 'sub' | 'mul' | 'mix';

export type QuizConfig = {
  mode: Mode;
  max: number;
};

export type Question = {
  a: number;
  b: number;
  op: '+' | '-' | '×';
  answer: number;
};

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randInt = (n: number) => Math.floor(Math.random() * (n + 1));

export const pickOp = (mode: Mode): Question['op'] => {
  if (mode === 'mix') return pick(['+', '-', '×'] as const);
  if (mode === 'add') return '+';
  if (mode === 'sub') return '-';
  return '×';
};

export const generateQuestion = (config: QuizConfig): Question => {
  const op = pickOp(config.mode);
  let a = randInt(config.max);
  let b = randInt(config.max);

  if (op === '-') {
    if (b > a) [a, b] = [b, a];
  }
  if (op === '×') {
    a = randInt(Math.max(10, Math.floor(config.max / 2)));
    b = randInt(Math.max(10, Math.floor(config.max / 2)));
  }

  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { a, b, op, answer };
};

export const checkAnswer = (q: Question, input: number) => input === q.answer;
