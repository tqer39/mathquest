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
};

export const generateQuizQuestion = (input: GenerateQuizInput = {}) => {
  const mode: Mode = input.mode ?? 'mix';
  const max = typeof input.max === 'number' && input.max > 0 ? input.max : 20;
  if (input.gradeId === 'grade-1') {
    return generateGradeOneQuestion(max);
  }
  return generateQuestion({ mode, max });
};

export type VerifyAnswerInput = {
  question: Pick<Question, 'a' | 'b' | 'op'> & {
    extras?: readonly ExtraStep[];
  };
  value: number;
};

export const verifyAnswer = ({ question, value }: VerifyAnswerInput) => {
  const correctAnswer = evaluateQuestion(question);
  const ok = checkAnswer({ ...question, answer: correctAnswer }, value);
  return { ok, correctAnswer };
};
