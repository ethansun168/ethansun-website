import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import { requireAuth } from "./auth.js";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from 'path';

let mcProcess: ChildProcessWithoutNullStreams | null = null;

const app = new Hono();
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const clients = new Map<string, WSContext<WebSocket>>();
const logBuffer: string[] = [];
const MAX_LOG_LINES = 500;

function addLog(line: string) {
  logBuffer.push(line);
  if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
}

const wsApp = app.get('/api/v1/minecraft/status', (c) => {
  if (mcProcess) {
    return c.json({"status": "online"});
  }
  else {
    return c.json({"status": "offline"});
  }
})
.post('/api/v1/minecraft/start', requireAuth, async (c) => {
  // If the server isn't on, start it
  if (mcProcess !== null) return c.json({"message": "Server already started"});
  const jarPath = path.resolve("mc/server.jar");
  const serverDir = path.dirname(jarPath);
  const memory = '2G';
  mcProcess = spawn(
    'java',
    [`-Xmx${memory}`, `-Xms${memory}`, '-jar', jarPath, 'nogui'],
    { cwd: serverDir, stdio: 'pipe' }
  ); 
  mcProcess.stdout.on('data', (data) => {
    const message = data.toString();
    addLog(message);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type: 'stdout', message}))
      }
    })
  })
  mcProcess.stderr.on('data', (data) => {
    const message = data.toString();
    addLog(message);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type: 'stderr', message}))
      }
    })
  });
  mcProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    mcProcess = null;
  })
  return c.json({"message": "Server started"});
})
.post('/api/v1/minecraft/stop', requireAuth, async(c) => {
  // If the server is on, stop it
  if (mcProcess === null) return c.json({"message": "Server has not started"});
  mcProcess.stdin.write("stop\n");
  mcProcess.stdin.end();
  return c.json({"message": "Server stopped"});
})
.get('/api/v1/minecraft/logs', requireAuth, upgradeWebSocket((c) => {
  const username = c.get('username');
  console.log(username);
  return {
    onOpen: (event, ws) => {
      clients.set(username, ws);
      console.log(clients);
      console.log("opened");
      logBuffer.forEach((line) => {
        ws.send(JSON.stringify({type: 'log', message: line}));
      })
    },
    onMessage: (event, ws) => {
      console.log(`Command: ${event.data}`);
      if (mcProcess) mcProcess.stdin.write(event.data + "\n");
    },
    onClose: () => {
      console.log('Connection closed');
      clients.delete(username);
    }
  }})
);

export type MinecraftApp = typeof wsApp;
export default app;
