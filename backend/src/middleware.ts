import { getSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { ROLES, RoleType } from "./types.js";
import { AppEnv, CookiePayload } from "./types.js";

export const AUTH_COOKIE_NAME = 'authCookie';

type AuthEnv = AppEnv & {
  Variables: AppEnv['Variables'] & { username: string, role: RoleType }
}

const hasPermission = (userRole: RoleType, requiredRole: RoleType) => {
  return ROLES[userRole] >= ROLES[requiredRole]
}

export const requireRole = (role: RoleType) => createMiddleware<AuthEnv>(async (c, next) => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME);
  if (!cookie) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const { username, role: userRole } = JSON.parse(cookie) as CookiePayload
  if (!username) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (!hasPermission(userRole, role)) {
    return c.json({ message: "Forbidden" }, 403)
  }

  c.set('username', username);
  c.set('role', userRole)
  return next()
})
