import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import { Hono } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import z from "zod";
import { getUser } from "./db.js";

dotenv.config();
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw new Error("Cookie secret invalid");

const AUTH_COOKIE_NAME = 'authCookie';
const SALT_ROUNDS = 5;
export async function hashPassword(plainPassword: string) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const ha = await bcrypt.hash(plainPassword, salt);
    return ha;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match;
}

export const requireAuth = createMiddleware<{
  Variables: {
    username: string
  }
}>(async (c, next) => {
  const username = await getSignedCookie(c, COOKIE_SECRET, AUTH_COOKIE_NAME);
  if (!username) {
    return c.json({message: "Unauthorized"}, 401);
  }
  c.set('username', username);
  await next();
})

const app = new Hono();

app.post(
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

    await setSignedCookie(c, AUTH_COOKIE_NAME, username, COOKIE_SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    return c.json(user);
  })
.get('/api/v1/me', requireAuth, async (c) => {
  const username = c.get('username');
  return c.json({"username": username});
})
.get('/api/v1/logout', async(c) => {
  deleteCookie(c, AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  return c.json({"message": "success"})
})

export default app;
