import type { Env } from '../../env';
import type { CurrentUser } from '../../application/session/current-user';
import {
  GUEST_FLAG_COOKIE,
  GUEST_PROFILE_COOKIE,
  SESSION_COOKIE_NAME,
} from '../../application/session/constants';

const MAGIC_TOKEN_PREFIX = 'magic:';
const SESSION_PREFIX = 'session:';
const USER_PREFIX = 'user:';
const MAGIC_LINK_TTL_SECONDS = 60 * 10;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type MagicRecord = {
  email: string;
};

type StoredSession = {
  email: string;
  user: CurrentUser;
  issuedAt: string;
};

type CookieOptions = {
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

const alphabet =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const palette = [
  '#2563eb',
  '#16a34a',
  '#f97316',
  '#d946ef',
  '#0ea5e9',
  '#f43f5e',
];

const gradeOptions: CurrentUser['grade'][] = [
  '小1',
  '小2',
  '小3',
  '小4',
  '小5',
  '小6',
];

const randomId = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
};

const sanitizeEmail = (email: string): string => email.trim().toLowerCase();

const sumCharCodes = (value: string): number => {
  let sum = 0;
  for (let i = 0; i < value.length; i += 1) {
    sum += value.charCodeAt(i);
  }
  return sum;
};

const toDisplayName = (email: string): string => {
  const [localPart] = email.split('@');
  if (!localPart) return 'メンバー';
  const normalized = localPart.replace(/[._+-]+/g, ' ').trim();
  if (!normalized) return 'メンバー';
  const words = normalized.split(/\s+/);
  const capitalized = words.map((word) => {
    const [first, ...rest] = word.split('');
    if (!first) return '';
    return first.toUpperCase() + rest.join('').toLowerCase();
  });
  const name = capitalized.filter(Boolean).join(' ');
  return name || 'メンバー';
};

const toAvatarColor = (email: string): string => {
  const index = sumCharCodes(email) % palette.length;
  return palette[index];
};

const toGrade = (email: string): CurrentUser['grade'] => {
  const index = sumCharCodes(email) % gradeOptions.length;
  return gradeOptions[index];
};

const buildCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): string => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (typeof options.maxAge === 'number') parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join('; ');
};

const isSecureRequest = (req: Request): boolean => {
  try {
    const url = new URL(req.url);
    return url.protocol === 'https:';
  } catch (error) {
    console.warn('failed to inspect request protocol', error);
    return false;
  }
};

const baseUrlFromRequest = (env: Env, req: Request): string => {
  const configured = env.APP_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
};

const storeMagicToken = async (
  env: Env,
  email: string
): Promise<string> => {
  const token = randomId(48);
  await env.KV_AUTH_SESSION.put(
    MAGIC_TOKEN_PREFIX + token,
    JSON.stringify({ email } satisfies MagicRecord),
    { expirationTtl: MAGIC_LINK_TTL_SECONDS }
  );
  return token;
};

const sendMagicLinkEmail = async (
  env: Env,
  email: string,
  magicLink: string
): Promise<void> => {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not configured.');
  }
  const subject = 'MathQuest ログインリンク';
  const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>${subject}</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a; }
      a.button { display: inline-flex; padding: 12px 24px; border-radius: 9999px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; }
      p { line-height: 1.6; margin: 0 0 16px; }
    </style>
  </head>
  <body>
    <p>MathQuest へのログインリクエストを受け付けました。</p>
    <p><a class="button" href="${magicLink}">ログインする</a></p>
    <p>上記のボタンが開けない場合は、次のリンクをブラウザにコピーしてアクセスしてください。</p>
    <p><a href="${magicLink}">${magicLink}</a></p>
    <p>このリンクの有効期限は10分です。身に覚えがない場合は本メールを破棄してください。</p>
  </body>
</html>`;
  const text = `以下のリンクから MathQuest にログインできます (10分間有効)\n${magicLink}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => 'unknown error');
    throw new Error(`Failed to send magic link email: ${response.status} ${detail}`);
  }
};

const getOrCreateUserProfile = async (
  env: Env,
  email: string
): Promise<CurrentUser> => {
  const key = USER_PREFIX + email;
  const stored = (await env.KV_AUTH_SESSION.get(key, 'json')) as
    | CurrentUser
    | null;
  if (stored) {
    return stored;
  }
  const displayName = toDisplayName(email);
  const grade = toGrade(email);
  const profile: CurrentUser = {
    id: `user-${randomId(12)}`,
    displayName,
    grade,
    avatarColor: toAvatarColor(email),
    badges: [],
    email,
  };
  await env.KV_AUTH_SESSION.put(key, JSON.stringify(profile));
  return profile;
};

export const requestMagicLink = async (
  env: Env,
  email: string,
  req: Request
): Promise<void> => {
  const normalized = sanitizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('invalid email');
  }
  const token = await storeMagicToken(env, normalized);
  const origin = baseUrlFromRequest(env, req);
  const magicLinkUrl = new URL('/auth/email/callback', origin);
  magicLinkUrl.searchParams.set('token', token);
  await sendMagicLinkEmail(env, normalized, magicLinkUrl.toString());
};

export const consumeMagicToken = async (
  env: Env,
  token: string
): Promise<string | null> => {
  const key = MAGIC_TOKEN_PREFIX + token;
  const record = (await env.KV_AUTH_SESSION.get(key, 'json')) as
    | MagicRecord
    | null;
  if (!record) return null;
  await env.KV_AUTH_SESSION.delete(key);
  return record.email;
};

export const createSessionForEmail = async (
  env: Env,
  email: string
): Promise<{ sessionId: string; user: CurrentUser }> => {
  const user = await getOrCreateUserProfile(env, email);
  const sessionId = randomId(48);
  const record: StoredSession = {
    email,
    user,
    issuedAt: new Date().toISOString(),
  };
  await env.KV_AUTH_SESSION.put(
    SESSION_PREFIX + sessionId,
    JSON.stringify(record),
    { expirationTtl: SESSION_TTL_SECONDS }
  );
  return { sessionId, user };
};

export const getSessionUser = async (
  env: Env,
  sessionId: string
): Promise<CurrentUser | null> => {
  const record = (await env.KV_AUTH_SESSION.get(
    SESSION_PREFIX + sessionId,
    'json'
  )) as StoredSession | null;
  if (!record) return null;
  return record.user ?? null;
};

export const deleteSession = async (
  env: Env,
  sessionId: string
): Promise<void> => {
  await env.KV_AUTH_SESSION.delete(SESSION_PREFIX + sessionId);
};

export const createSessionCookie = (
  sessionId: string,
  req: Request
): string =>
  buildCookie(SESSION_COOKIE_NAME, sessionId, {
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: 'Lax',
  });

export const expireSessionCookie = (req: Request): string =>
  buildCookie(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: 'Lax',
  });

export const clearGuestCookieHeaders = (): [string, string] => [
  `${GUEST_FLAG_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`,
  `${GUEST_PROFILE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`,
];
