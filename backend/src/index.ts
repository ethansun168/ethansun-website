import dotenv from 'dotenv';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verifyPassword } from './auth.js';
import { getUser } from './db.js';

dotenv.config();
const app = new Hono()

app.use("*", cors());

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1', (c) => {
    return c.json({"hello": "world"})
})

app.post('/api/v1/login', async (c) => {
    const body = await c.req.json();
    const username = body.username;
    const password = body.password;
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
