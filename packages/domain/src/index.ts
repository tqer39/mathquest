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
  let a: number;
  let b: number;

  if (op === '+') {
    do {
      a = randInt(config.max);
      b = randInt(config.max);
    } while (a + b > config.max);
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

  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { a, b, op, answer };
};

export const checkAnswer = (q: Question, input: number) => input === q.answer;

export const evaluateQuestion = (input: Pick<Question, 'a' | 'b' | 'op'>) =>
  input.op === '+'
    ? input.a + input.b
    : input.op === '-'
      ? input.a - input.b
      : input.a * input.b;
