import type { Context, Next } from 'hono';

export function i18n() {
  return async (c: Context, next: Next) => {
    // Cookie > query > Accept-Language > default
    const q = c.req.query('lang');
    const cookie = c.req.cookie('lang');
    const hdr = c.req.header('accept-language') || '';
    const fromUA = hdr.toLowerCase().startsWith('ja') ? 'ja' : 'en';
    const lang = (q ||
      cookie ||
      fromUA ||
      (c.env as any).DEFAULT_LANG ||
      'ja') as 'ja' | 'en';
    c.set('lang', lang);
    if (q && q !== cookie)
      c.header(
        'Set-Cookie',
        `lang=${q}; Path=/; Max-Age=2592000; SameSite=Lax`
      );
    await next();
  };
}
