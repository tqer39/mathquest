import type { Env } from '../../env';

export type CurrentUser = {
  id: string;
  displayName: string;
  grade: '小1' | '小2' | '小3' | '小4' | '小5' | '小6';
  avatarColor: string;
  badges: readonly string[];
};

const fallbackUser: CurrentUser = {
  id: 'dev-user-001',
  displayName: 'みらい ミナト',
  grade: '小3',
  avatarColor: '#4fa2b1',
  badges: ['九九マスター', 'れんしゅう王'],
};

const shouldUseMockUser = (env: Env): boolean => {
  const flag = (env as Record<string, string | undefined>).USE_MOCK_USER;
  if (typeof flag === 'string') {
    return flag !== 'false';
  }
  return true;
};

export const resolveCurrentUser = (env: Env): CurrentUser | null => {
  if (!shouldUseMockUser(env)) {
    return null;
  }
  return fallbackUser;
};
