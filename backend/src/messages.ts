import { Hono } from "hono";
import { createMessage, deleteMessage, editMessage, getMessages } from "../db/messages.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { requireRole } from "./middleware.js";
import { AppEnv } from "./types.js";

const app = new Hono<AppEnv>()
  .get('/api/v1/messages', requireRole("baby"), async (c) => {
    const messages = await getMessages(c.get('db'));
    return c.json(messages)
  })
  .post('/api/v1/messages',
    requireRole("baby"),
    zValidator(
      'json',
      z.object({
        message: z.string()
      })
    ),
    async (c) => {
      // Create message
      const username = c.get("username")
      const { message } = c.req.valid('json');
      await createMessage(c.get('db'), username, message)
      return c.json({ "message": "Message created" })
    })
  .patch('/api/v1/messages/:id',
    requireRole("baby"),
    zValidator(
      'json',
      z.object({
        message: z.string()
      })
    ),
    async (c) => {
      // Edit message
      const username = c.get("username")
      const id = c.req.param('id')
      const { message } = c.req.valid('json');
      if (await editMessage(c.get('db'), id, message, username)) {
        return c.body(null, 204)
      }
      return c.json({ "message": "Message update failed" }, 404)
    })
  .delete('/api/v1/messages/:id',
    requireRole("baby"),
    async (c) => {
      // Delete message
      const username = c.get("username")
      const id = c.req.param('id')
      if (await deleteMessage(c.get('db'), id, username)) {
        return c.body(null, 204)
      }
      return c.json({ "message": "Message deletion failed" }, 404)

    })

export default app;
