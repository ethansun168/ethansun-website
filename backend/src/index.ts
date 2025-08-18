import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verifyPassword } from './auth.js';
import { getUser } from './db.js';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';

dotenv.config();
const app = new Hono()

const route = app.use("*", cors())
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
        console.log(user);
        if (!user) {
            return c.json({"message": "Failed to get user"}, 400);
        }
        if (!await verifyPassword(password, user.password)) {
            return c.json({"message": "Wrong password"}, 401)
        }
        return c.json(user)
    })

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

export type AppType = typeof route;
