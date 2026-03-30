import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { createUser, deleteUser, editUserRole, getUsers } from "../db/db.js";
import { ROLES } from "../db/schema.js";
import { isAdmin } from "./middleware.js";
import { AppEnv } from "./types.js";

const app = new Hono<AppEnv>()
  .get("/api/v1/users", isAdmin, async (c) => {
    const users = await getUsers(c.get('db'))
    return c.json(users)
  })
  .post("/api/v1/users",
    isAdmin,
    zValidator(
      'json',
      z.object({
        username: z.string(),
        password: z.string()
      })
    ),
    async (c) => {
      const { username, password } = c.req.valid('json')
      const err = await createUser(c.get('db'), username, password)
      if (err) {
        return c.json({ message: err.message }, 409)
      }
      return c.body(null, 204)
    }
  )
  .patch("/api/v1/users/:username",
    isAdmin,
    zValidator(
      'json',
      z.object({
        role: z.enum(ROLES)
      })
    ),
    async (c) => {
      // User cannot change own role
      const reqUser = c.get('username')
      const username = c.req.param('username')
      if (reqUser === username) {
        return c.json({ message: "Cannot change own role" }, 403)
      }
      const { role } = c.req.valid('json')

      if (await editUserRole(c.get('db'), username, role)) {
        return c.body(null, 204)
      }

      return c.json({ "message": "User update failed" }, 404)
    })
  .delete("/api/v1/users/:username", isAdmin, async (c) => {
    // Cannot delete own user
    const reqUser = c.get('username')
    const username = c.req.param('username')
    if (reqUser === username) {
      return c.json({ message: "Cannot delete own account" }, 403)
    }
    if (await deleteUser(c.get('db'), username)) {
      return c.body(null, 204)
    }
    return c.json({ "message": "User delete failed" }, 404)
  })

export default app;
