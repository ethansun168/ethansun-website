import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from './auth.js';
import messages from './messages.js';
import { getSystemStatus } from './system-status.js';
import { requireAuth } from './middleware.js';
import { createDb } from '../db/db.js';
import { Bindings, Variables } from './types.js';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().use("*", cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://ethansun.org'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'ngrok-skip-browser-warning'],
  credentials: true,
}))

app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.DB))
  await next();
});

app.use(logger());

const route = app.get('/api/v1', (c) => {
  const routes = app.routes
    .filter((r) => r.method !== "ALL")
    .map((r) => ({ method: r.method, path: r.path }))
    .filter((r, i, arr) =>
      arr.findIndex(x => x.method === r.method && x.path === r.path) === i
    )
  return c.json(routes)
})
  // .get('/api/v1/dashboard', requireAuth, async (c) => {
  //   const status = await getSystemStatus();
  //   return c.json(status);
  // })
  .route('/', auth)
  .route('/', messages)

export default app;

export type AppType = typeof route;
