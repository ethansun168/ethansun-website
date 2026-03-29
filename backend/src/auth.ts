import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { deleteCookie, setSignedCookie } from "hono/cookie";
import z from "zod";
import { getUser } from "../db/db.js";
import { AUTH_COOKIE_NAME, requireAuth } from "./middleware.js";
import { Bindings, Variables } from "./types.js";

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


const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .post(
    '/api/v1/login',
    zValidator(
      'json',
      z.object({
        username: z.string(),
        password: z.string(),
      })
    ), async (c) => {
      const { username, password } = c.req.valid('json');

      const user = await getUser(c.get('db'), username);
      if (!user || !await verifyPassword(password, user.password)) {
        return c.json({ "message": "Invalid credentials" }, 401);
      }

      await setSignedCookie(c, AUTH_COOKIE_NAME, username, c.env.COOKIE_SECRET, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60,
        path: '/'
      });

      const { password: pw, ...safeUser } = user;
      return c.json(safeUser);
    })
  .get('/api/v1/me', requireAuth, async (c) => {
    const username = c.get('username');
    const user = await getUser(c.get('db'), username);
    if (!user) {
      return c.json({ "message": "User not found" }, 404)
    }
    // Exclude password
    const { password: pw, ...safeUser } = user;
    return c.json(safeUser);
  })
  .get('/api/v1/logout', requireAuth, async (c) => {
    deleteCookie(c, AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });
    return c.json({ "message": "Logged out" })
  })

export default app;
