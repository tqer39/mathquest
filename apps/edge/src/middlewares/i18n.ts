import type { Context, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

export function i18n() {
  return async (c: Context, next: Next) => {
    // Cookie > query > Accept-Language > default
    const q = c.req.query('lang');
    const cookie = getCookie(c, 'lang');
    const hdr = c.req.header('accept-language') || '';
    const fromUA = hdr.toLowerCase().startsWith('ja') ? 'ja' : 'en';
    const lang = (q ||
      cookie ||
      fromUA ||
      (c.env as any).DEFAULT_LANG ||
      'ja') as 'ja' | 'en';
    c.set('lang', lang);
    if (q && q !== cookie) {
      setCookie(c, 'lang', q, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'Lax',
      });
    }
    await next();
  };
}
