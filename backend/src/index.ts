import dotenv from 'dotenv';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

dotenv.config();
const app = new Hono()

app.use("*", cors());

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api', (c) => {
    return c.json({"hello": "world"})
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
