import type { Mode, Question, QuizConfig } from '@mathquest/domain';
import { checkAnswer as check, generateQuestion } from '@mathquest/domain';

export type StartQuizInput = {
  mode: Mode;
  max: number;
  total: number;
};

export type Quiz = {
  config: QuizConfig & { total: number };
  index: number;
  correct: number;
};

export const createQuiz = (input: StartQuizInput): Quiz => ({
  config: { mode: input.mode, max: input.max, total: input.total },
  index: 0,
  correct: 0,
});

export const nextQuestion = (quiz: Quiz): Question => {
  return generateQuestion({ mode: quiz.config.mode, max: quiz.config.max });
};

export const checkAnswer = (quiz: Quiz, q: Question, value: number) => {
  const ok = check(q, value);
  quiz.index += 1;
  if (ok) quiz.correct += 1;
  return ok;
};
