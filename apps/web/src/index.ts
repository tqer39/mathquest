import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from 'hono/serve-static'

const app = new Hono()

app.get('/', serveStatic({ path: './public/index.html' }))
app.get('/assets/*', serveStatic({ root: './public' }))

const port = Number(process.env.PORT || 8788)
console.log(`[web] listening on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
