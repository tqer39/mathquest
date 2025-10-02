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

const guestProfiles: readonly CurrentUser[] = [
  {
    id: 'guest-001',
    displayName: 'なかま ひなた',
    grade: '小2',
    avatarColor: '#f97316',
    badges: [],
  },
  {
    id: 'guest-002',
    displayName: 'なかま ゆめ',
    grade: '小1',
    avatarColor: '#16a34a',
    badges: [],
  },
  {
    id: 'guest-003',
    displayName: 'ゲスト みらい',
    grade: '小1',
    avatarColor: '#2563eb',
    badges: [],
  },
  {
    id: 'guest-004',
    displayName: 'なかま ゆめ',
    grade: '小3',
    avatarColor: '#d946ef',
    badges: [],
  },
  {
    id: 'guest-005',
    displayName: 'フレンド ひなた',
    grade: '小4',
    avatarColor: '#38bdf8',
    badges: [],
  },
  {
    id: 'guest-006',
    displayName: 'ゲスト ゆめ',
    grade: '小1',
    avatarColor: '#facc15',
    badges: [],
  },
  {
    id: 'guest-007',
    displayName: 'なかま ひなた',
    grade: '小5',
    avatarColor: '#f97316',
    badges: [],
  },
  {
    id: 'guest-008',
    displayName: 'なかま りん',
    grade: '小6',
    avatarColor: '#16a34a',
    badges: [],
  },
];

const shouldUseMockUser = (env: Env): boolean => {
  const flag = (env as Record<string, string | undefined>).USE_MOCK_USER;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return false;
};

const parseCookie = (header: string | null): Map<string, string> => {
  const map = new Map<string, string>();
  if (!header) return map;
  header.split(';').forEach((part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) return;
    const key = rawKey.trim();
    const value = rawValue.join('=').trim();
    if (key) map.set(key, decodeURIComponent(value));
  });
  return map;
};

const resolveGuestFromCookie = (
  cookies: Map<string, string>
): CurrentUser | null => {
  if (cookies.get('mq_guest') !== '1') return null;
  const index = Number(cookies.get('mq_guest_profile'));
  if (Number.isInteger(index) && index >= 0 && index < guestProfiles.length) {
    return guestProfiles[index];
  }
  return guestProfiles[0] ?? null;
};

export const resolveCurrentUser = (
  env: Env,
  req: Request
): CurrentUser | null => {
  const cookies = parseCookie(req.headers.get('Cookie'));
  const guest = resolveGuestFromCookie(cookies);
  if (guest) return guest;
  if (shouldUseMockUser(env)) {
    return fallbackUser;
  }
  return null;
};
