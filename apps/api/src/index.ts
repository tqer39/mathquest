import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/serve-static'
import type { Mode } from '@ed-games/domain'
import { generateQuestion, checkAnswer as check } from '@ed-games/domain'

const app = new Hono()

app.use('*', cors())

app.get('/healthz', (c) => c.json({ ok: true }))

app.post('/v1/questions/next', async (c) => {
  type Body = { mode?: Mode; max?: number }
  const body = (await c.req.json().catch(() => ({}))) as Body
  const mode = body.mode ?? 'mix'
  const max = typeof body.max === 'number' ? body.max : 20
  const q = generateQuestion({ mode, max })
  return c.json({ question: q })
})

app.post('/v1/answers/check', async (c) => {
  type Body = { a: number; b: number; op: '+' | '-' | '×'; value: number }
  const body = (await c.req.json()) as Body
  const correctAnswer = body.op === '+' ? body.a + body.b : body.op === '-' ? body.a - body.b : body.a * body.b
  const ok = check({ a: body.a, b: body.b, op: body.op, answer: correctAnswer }, body.value)
  return c.json({ ok, correctAnswer })
})

app.get('/', serveStatic({ path: './public/index.html' }))
app.get('/assets/*', serveStatic({ root: './public' }))

const port = Number(process.env.PORT || 8787)
console.log(`[api] listening on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
