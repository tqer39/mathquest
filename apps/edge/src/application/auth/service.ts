import { and, eq } from 'drizzle-orm';
import { createDb, schema } from '../../infrastructure/database/client';
import type { Env } from '../../env';
import type { CurrentUser } from '../session/current-user';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const avatarPalette = [
  '#f97316',
  '#16a34a',
  '#2563eb',
  '#d946ef',
  '#38bdf8',
  '#facc15',
  '#f43f5e',
  '#6366f1',
];

const badgeFallback: readonly string[] = [];

const sessionCookieName = 'mq_session';
const guestCookieName = 'mq_guest';
const guestProfileCookieName = 'mq_guest_profile';

const hours = (value: number) => value * 60 * 60 * 1000;
const days = (value: number) => hours(24) * value;

const toIso = (msFromNow: number): string =>
  new Date(Date.now() + msFromNow).toISOString();

const base64UrlEncode = (input: ArrayBuffer): string => {
  const bytes = new Uint8Array(input);
  let str = '';
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const randomToken = (size = 32): string => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
};

const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
};

const pickAvatar = (seed: string): string => {
  const index = Math.abs([...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    avatarPalette.length;
  return avatarPalette[index] ?? avatarPalette[0] ?? '#4fa2b1';
};

const parseCookieHeader = (header: string | null): Map<string, string> => {
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

const parseBadges = (badgesJson: string | null | undefined): readonly string[] => {
  if (!badgesJson) return badgeFallback;
  try {
    const parsed = JSON.parse(badgesJson);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed as readonly string[];
    }
    return badgeFallback;
  } catch (error) {
    console.error('Failed to parse badges JSON', error);
    return badgeFallback;
  }
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export type MagicLinkRequest = {
  email: string;
  redirectTo?: string | null;
};

export type MagicLinkVerificationResult = {
  currentUser: CurrentUser;
  sessionToken: string;
  redirectTo?: string | null;
};

export class BetterAuthService {
  static sessionCookieName = sessionCookieName;
  static guestCookieName = guestCookieName;
  static guestProfileCookieName = guestProfileCookieName;

  private readonly db = createDb(this.env);

  constructor(private readonly env: Env) {}

  async requestMagicLink({
    email,
    redirectTo,
  }: MagicLinkRequest): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('メールアドレスの形式が正しくありません');
    }

    const rawToken = randomToken(48);
    const tokenHash = await hashToken(rawToken);
    const expiresAt = toIso(hours(1));

    await this.db
      .delete(schema.authLoginTokens)
      .where(eq(schema.authLoginTokens.email, normalizedEmail))
      .run();

    await this.db
      .insert(schema.authLoginTokens)
      .values({
        email: normalizedEmail,
        tokenHash,
        redirectTo: redirectTo ?? null,
        expiresAt,
      })
      .run();

    const baseUrl = this.env.AUTH_BASE_URL;
    if (!baseUrl) {
      throw new Error('AUTH_BASE_URL が設定されていません');
    }

    const loginUrl = new URL('/auth/callback', baseUrl);
    loginUrl.searchParams.set('token', rawToken);
    loginUrl.searchParams.set('email', normalizedEmail);
    if (redirectTo) {
      loginUrl.searchParams.set('redirect', redirectTo);
    }

    await this.sendMagicLinkEmail(normalizedEmail, loginUrl.toString());
  }

  async verifyMagicLink(
    token: string,
    email: string
  ): Promise<MagicLinkVerificationResult | null> {
    const normalizedEmail = normalizeEmail(email);
    const tokenHash = await hashToken(token);

    const record = await this.db.query.authLoginTokens.findFirst({
      where: and(
        eq(schema.authLoginTokens.tokenHash, tokenHash),
        eq(schema.authLoginTokens.email, normalizedEmail)
      ),
    });

    if (!record) {
      return null;
    }

    const now = Date.now();
    if (new Date(record.expiresAt).getTime() < now) {
      await this.db
        .delete(schema.authLoginTokens)
        .where(eq(schema.authLoginTokens.id, record.id))
        .run();
      return null;
    }

    if (record.consumedAt) {
      return null;
    }

    await this.db
      .update(schema.authLoginTokens)
      .set({ consumedAt: new Date().toISOString() })
      .where(eq(schema.authLoginTokens.id, record.id))
      .run();

    let user = await this.db.query.authUsers.findFirst({
      where: eq(schema.authUsers.email, normalizedEmail),
    });

    if (!user) {
      const generatedId = `usr_${randomToken(16)}`;
      const displayName = normalizedEmail.split('@')[0] || 'MathQuest ユーザー';
      const grade: CurrentUser['grade'] = '小3';
      const avatarColor = pickAvatar(normalizedEmail);

      await this.db
        .insert(schema.authUsers)
        .values({
          id: generatedId,
          email: normalizedEmail,
          displayName,
          grade,
          avatarColor,
          badgesJson: JSON.stringify([]),
        })
        .run();

      user = await this.db.query.authUsers.findFirst({
        where: eq(schema.authUsers.id, generatedId),
      });
    }

    if (!user) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    const sessionToken = randomToken(48);
    const sessionHash = await hashToken(sessionToken);
    const sessionExpiresAt = toIso(days(30));

    await this.db
      .insert(schema.authSessions)
      .values({
        tokenHash: sessionHash,
        userId: user.id,
        expiresAt: sessionExpiresAt,
      })
      .run();

    return {
      currentUser: this.mapUserToCurrentUser(user),
      sessionToken,
      redirectTo: record.redirectTo ?? undefined,
    };
  }

  async resolveCurrentUser(sessionToken: string): Promise<CurrentUser | null> {
    const tokenHash = await hashToken(sessionToken);
    const session = await this.db.query.authSessions.findFirst({
      where: eq(schema.authSessions.tokenHash, tokenHash),
    });

    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await this.db
        .delete(schema.authSessions)
        .where(eq(schema.authSessions.id, session.id))
        .run();
      return null;
    }

    const user = await this.db.query.authUsers.findFirst({
      where: eq(schema.authUsers.id, session.userId),
    });

    if (!user) {
      await this.db
        .delete(schema.authSessions)
        .where(eq(schema.authSessions.id, session.id))
        .run();
      return null;
    }

    return this.mapUserToCurrentUser(user);
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    const tokenHash = await hashToken(sessionToken);
    await this.db
      .delete(schema.authSessions)
      .where(eq(schema.authSessions.tokenHash, tokenHash))
      .run();
  }

  extractSessionFromRequest(request: Request): string | null {
    const cookies = parseCookieHeader(request.headers.get('Cookie'));
    return cookies.get(sessionCookieName) ?? null;
  }

  createSessionCookie(sessionToken: string): string {
    const maxAge = 60 * 60 * 24 * 30;
    return `${sessionCookieName}=${encodeURIComponent(
      sessionToken
    )}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
  }

  clearSessionCookie(): string {
    return `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
  }

  clearGuestCookies(): string[] {
    return [
      `${guestCookieName}=; Path=/; Max-Age=0; SameSite=Lax`,
      `${guestProfileCookieName}=; Path=/; Max-Age=0; SameSite=Lax`,
    ];
  }

  private mapUserToCurrentUser(user: schema.AuthUser): CurrentUser {
    return {
      id: user.id,
      displayName: user.displayName,
      grade: user.grade as CurrentUser['grade'],
      avatarColor: user.avatarColor,
      badges: parseBadges(user.badgesJson),
    };
  }

  private async sendMagicLinkEmail(
    email: string,
    loginUrl: string
  ): Promise<void> {
    const apiKey = this.env.RESEND_API_KEY;
    const from = this.env.AUTH_EMAIL_FROM;

    if (!apiKey || !from) {
      throw new Error('Resendの設定が不足しています');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'MathQuest ログインリンク',
        text: `MathQuestへのログインリンクです。\n\n以下のURLを30分以内に開いてログインを完了してください。\n${loginUrl}\n\nもしこのメールに心当たりがない場合は破棄してください。`,
        html: `<p>MathQuestへのログインリンクです。</p><p>以下のボタンを30分以内にクリックしてください。</p><p><a href="${loginUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#2563eb;color:white;text-decoration:none;font-weight:bold;">MathQuestにログインする</a></p><p>もしこのメールに心当たりがない場合は破棄してください。</p>`,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Resendでのメール送信に失敗しました: ${message}`);
    }
  }
}

export { sessionCookieName };
