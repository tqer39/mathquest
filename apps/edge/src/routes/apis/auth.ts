import { Hono } from 'hono';
import type { Env } from '../../env';
import { parseCookie } from '../../application/session/current-user';
import {
  GUEST_FLAG_COOKIE,
  GUEST_PROFILE_COOKIE,
  SESSION_COOKIE_NAME,
} from '../../application/session/constants';
import {
  clearGuestCookieHeaders,
  consumeMagicToken,
  createSessionCookie,
  createSessionForEmail,
  deleteSession,
  expireSessionCookie,
  requestMagicLink,
} from '../../infrastructure/auth/better-auth';

export const auth = new Hono<{ Bindings: Env }>();

const isLocalHost = (req: Request): boolean => {
  const url = new URL(req.url);
  const hostname = url.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local')
  );
};

auth.post('/email', async (c) => {
  const payload = (await c.req.json().catch(() => ({}))) as {
    email?: string;
  };
  if (!payload.email) {
    return c.json({ error: 'メールアドレスを入力してください。' }, 400);
  }
  try {
    await requestMagicLink(c.env, payload.email, c.req.raw);
  } catch (error) {
    console.error('failed to send magic link email', error);
    if (error instanceof Error && error.message === 'invalid email') {
      return c.json(
        { error: 'メールアドレスの形式が正しくありません。' },
        400
      );
    }
    return c.json(
      {
        error:
          'メール送信に失敗しました。時間を置いて再度お試しください。',
      },
      500
    );
  }
  return c.json({ ok: true });
});

auth.get('/email/callback', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.text('リンクが無効か期限切れです。', 400);
  }
  const email = await consumeMagicToken(c.env, token);
  if (!email) {
    return c.text('リンクが無効か期限切れです。', 400);
  }
  try {
    const { sessionId } = await createSessionForEmail(c.env, email);
    const response = c.redirect('/', 302);
    response.headers.append(
      'Set-Cookie',
      createSessionCookie(sessionId, c.req.raw)
    );
    const [clearGuestFlag, clearGuestProfile] = clearGuestCookieHeaders();
    response.headers.append('Set-Cookie', clearGuestFlag);
    response.headers.append('Set-Cookie', clearGuestProfile);
    return response;
  } catch (error) {
    console.error('failed to create session', error);
    return c.text('サインインに失敗しました。時間を置いて再度お試しください。', 500);
  }
});

auth.get('/guest-login', (c) => {
  if (!isLocalHost(c.req.raw)) {
    return c.redirect('/auth/signin', 302);
  }
  const profileParam = c.req.query('profile');
  const profileIndex = Number(profileParam);
  const index =
    Number.isInteger(profileIndex) && profileIndex >= 0
      ? profileIndex
      : 0;
  const maxAge = 60 * 60 * 24 * 30;
  const response = c.redirect('/', 302);
  response.headers.append(
    'Set-Cookie',
    `${GUEST_FLAG_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  );
  response.headers.append(
    'Set-Cookie',
    `${GUEST_PROFILE_COOKIE}=${index}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  );
  response.headers.append('Set-Cookie', expireSessionCookie(c.req.raw));
  return response;
});

auth.get('/logout', async (c) => {
  const cookies = parseCookie(c.req.header('Cookie') ?? null);
  const sessionId = cookies.get(SESSION_COOKIE_NAME);
  if (sessionId) {
    try {
      await deleteSession(c.env, sessionId);
    } catch (error) {
      console.error('failed to delete session', error);
    }
  }
  const response = c.redirect('/', 302);
  response.headers.append('Set-Cookie', expireSessionCookie(c.req.raw));
  const [clearGuestFlag, clearGuestProfile] = clearGuestCookieHeaders();
  response.headers.append('Set-Cookie', clearGuestFlag);
  response.headers.append('Set-Cookie', clearGuestProfile);
  return response;
});

auth.get('/signin', (c) => c.text('サインイン（ダミー）'));
