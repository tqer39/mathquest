import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import net from 'node:net'
import type { AddressInfo } from 'node:net'

const app = new Hono()

app.get('/', serveStatic({ path: './public/index.html' }))
app.get('/assets/*', serveStatic({ root: './public' }))

const preferredPort = Number(process.env.PORT || 8788)

async function getAvailablePort(preferred: number): Promise<number> {
  // 指定ポートが空いていればそれを、ダメなら 0 で OS に割り当てさせる
  return await new Promise((resolve) => {
    const server = net.createServer()

    const useRandom = () => {
      const s = net.createServer()
      s.listen(0, () => {
        const addr = s.address() as AddressInfo
        const p = addr.port
        s.close(() => resolve(p))
      })
    }

    server.once('error', () => {
      // 競合など → ランダム空きポート
      useRandom()
    })
    server.listen(preferred, () => {
      const addr = server.address() as AddressInfo
      const p = addr.port
      server.close(() => resolve(p))
    })
  })
}

async function main() {
  const port = await getAvailablePort(preferredPort)
  if (port !== preferredPort) {
    console.log(`[web] port ${preferredPort} in use. falling back to ${port}`)
  }
  console.log(`[web] listening on http://localhost:${port}`)
  serve({ fetch: app.fetch, port })
}

void main()
