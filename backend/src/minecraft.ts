import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";

const app = new Hono();
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get('/status', (c) => c.json({status: "test"}))
  .get('/ws', upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('Connection closed');
      }
    }})
  );


export default app;
