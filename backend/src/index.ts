import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth, { requireAuth } from './auth.js';
import minecraft, { injectWebSocket } from './minecraft.js';
import { getSystemStatus } from './system-status.js';
import { logger } from 'hono/logger';
import messages from './messages.js'

const app = new Hono().use("*", cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://ethansun.org'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'ngrok-skip-browser-warning'],
  credentials: true,
}))

app.use(logger())
const route = app.get('/api/v1', (c) => {
  const routes = app.routes
    .filter((r) => r.method !== "ALL")
    .map((r) => ({ method: r.method, path: r.path }))
    .filter((r, i, arr) =>
      arr.findIndex(x => x.method === r.method && x.path === r.path) === i
    )
  return c.json(routes)
})
  .get('/api/v1/dashboard', requireAuth, async (c) => {
    const status = await getSystemStatus();
    return c.json(status);
  })
  .route('/', auth)
  .route('/', minecraft)
  .route('/', messages)

const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

injectWebSocket(server);

export type AppType = typeof route;
export * from './minecraft.js';
