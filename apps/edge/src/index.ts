import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import type { Env } from './env'
import { i18n } from './middlewares/i18n'
import { freeTrial } from './middlewares/free-trial'
import { quiz } from './routes/apis/quiz'
import { Home } from './routes/pages/home'

const app = new Hono<{ Bindings: Env; Variables: { lang: 'ja' | 'en' } }>()

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', prettyJSON())
app.use('*', i18n())

// SSR renderer
app.get(
  '*',
  jsxRenderer((c) => ({
    docType: `<!doctype html>`,
    lang: c.var.lang ?? 'ja',
  }))
)

// Public top
app.get('/', (c) => c.render(<Home />))

// Free trial gating for pages under /play (example)
app.use('/play/*', freeTrial())

// BFF API
app.route('/apis/quiz', quiz)

export default app
