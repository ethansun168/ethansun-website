import { getSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { Bindings } from "./types.js";

export const AUTH_COOKIE_NAME = 'authCookie';

export const requireAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: {
    username: string
  }
}>(async (c, next) => {
  const username = await getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME);
  if (!username) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set('username', username);
  await next();
})
