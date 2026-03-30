import { getSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "./types.js";
import { getUser } from "../db/db.js";

export const AUTH_COOKIE_NAME = 'authCookie';

type AuthEnv = AppEnv & {
  Variables: AppEnv['Variables'] & { username: string }
}

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const username = await getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME);
  if (!username) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set('username', username);
  await next();
})

export const isAdmin = createMiddleware<AuthEnv>(async (c, next) => {
  const username = await getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME);
  if (!username) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set('username', username);

  const user = await getUser(c.get('db'), username)
  if (!user || user.role !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403)
  }
  await next();
})
