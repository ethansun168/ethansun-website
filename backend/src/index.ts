import { serve } from '@hono/node-server';
import { zValidator } from '@hono/zod-validator';
import dotenv from 'dotenv';
import { Hono } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import z from 'zod';
import { verifyPassword } from './auth.js';
import { getUser } from './db.js';
import { getSystemStatus } from './system-status.js';
dotenv.config();

const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw new Error("Cookie secret invalid");

const app = new Hono()

const route = app.use("*", cors({
  origin: [ 'http://localhost:5173', 'https://ethansun.org'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'ngrok-skip-browser-warning'],
  credentials: true,
}))
.get('/', (c) => {
  return c.text('Hello Hono!')
})
.get('/api/v1', (c) => {
  return c.json({"hello": "world"})
})
.post(
  '/api/v1/login',
  zValidator(
    'json',
    z.object({
      username: z.string(),
      password: z.string(),
    })
  ), async (c) => {
    const {username, password} = c.req.valid('json');
    const user = await getUser(username);
    if (!user) {
      return c.json({"message": "Failed to get user"}, 400);
    }
    if (!await verifyPassword(password, user.password)) {
      return c.json({"message": "Wrong password"}, 401)
    }

    await setSignedCookie(c, "authCookie", username, COOKIE_SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    return c.json(user);
  })
.get('/api/v1/me', async (c) => {
  const username = await getSignedCookie(c, COOKIE_SECRET, 'authCookie');
  if (!username) {
    return c.json({"message": "Unauthorized"}, 401);
  }
  return c.json({"username": username});
})
.get('/api/v1/logout', async(c) => {
  deleteCookie(c, "authCookie", {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  return c.json({"message": "success"})
})
.get('/api/v1/dashboard', async(c) => {
  const status = await getSystemStatus();
  return c.json(status);
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })

export type AppType = typeof route;
