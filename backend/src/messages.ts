import { Hono } from "hono";
import { requireAuth } from "./auth.js";
import { createMessage, deleteMessage, editMessage, getMessages } from "../db/db.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const app = new Hono()
  .get('/api/v1/messages', requireAuth, async (c) => {
    const username = c.get("username")
    const messages = await getMessages(username);
    return c.json(messages)
  })
  .post('/api/v1/messages',
    requireAuth,
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
      await createMessage(username, message)
      return c.json({ "message": "Message created" })
    })
  .patch('/api/v1/messages/:id',
    requireAuth,
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
      if (await editMessage(id, message, username)) {
        return c.body(null, 204)
      }
      return c.json({ "message": "Message update failed" }, 404)
    })
  .delete('/api/v1/messages/:id',
    requireAuth,
    async (c) => {
      // Delete message
      const username = c.get("username")
      const id = c.req.param('id')
      if (await deleteMessage(id, username)) {
        return c.body(null, 204)
      }
      return c.json({ "message": "Message deletion failed" }, 404)

    })

export default app;
