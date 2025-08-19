import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth, { requireAuth } from './auth.js';
import { getSystemStatus } from './system-status.js';

const app = new Hono().use("*", cors({
  origin: [ 'http://localhost:5173', 'https://ethansun.org'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'ngrok-skip-browser-warning'],
  credentials: true,
}))

const route = app.get('/', (c) => {
  return c.text('Hello Hono!')
})
.get('/api/v1', (c) => {
  return c.json({"hello": "world"})
})
.get('/api/v1/dashboard', requireAuth, async(c) => {
  const status = await getSystemStatus();
  return c.json(status);
})
.route('/', auth);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })

export type AppType = typeof route;
