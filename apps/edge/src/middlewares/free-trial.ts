import type { Context, Next } from 'hono'

const COOKIE = 'aid'
const LIMIT = 3

function uid() {
  const r = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(r, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function freeTrial() {
  return async (c: Context, next: Next) => {
    // Allow public assets and auth routes freely
    const path = new URL(c.req.url).pathname
    if (path.startsWith('/assets') || path.startsWith('/auth') || path === '/') {
      return next()
    }

    // Identify anonymous user via cookie
    let aid = c.req.cookie(COOKIE)
    if (!aid) {
      aid = uid()
      c.header('Set-Cookie', `${COOKIE}=${aid}; Path=/; Max-Age=31536000; SameSite=Lax`)
    }

    const key = `ft:${aid}`
    const val = await c.env.KV_FREE_TRIAL.get(key)
    const count = Number(val || '0')

    if (count >= LIMIT) {
      // Gate: require sign-in (placeholder)
      return c.redirect('/auth/signin')
    }

    // Increment read count with short TTL
    await c.env.KV_FREE_TRIAL.put(key, String(count + 1), { expirationTtl: 3600 })
    await next()
  }
}
