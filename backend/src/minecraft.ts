import { createNodeWebSocket } from "@hono/node-ws";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import path from 'path';
import z from "zod";
import { requireAuth } from "./auth.js";

const fileItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['file', 'folder']),
    expanded: z.boolean().optional(),
    content: z.string().optional(),
    children: z.array(fileItemSchema).optional(),
  })
);

export type FileItem = z.infer<typeof fileItemSchema>;

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

const generateId = (filePath: string) => Buffer.from(filePath).toString('base64');

function readDirToFileItems(dirPath: string): FileItem[] {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const ignoreDir = ['libraries', 'world', 'logs', 'versions'];
  const ignoreFiles = ['server.jar'];

  const sortedEntries = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  return sortedEntries.map((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoreDir.includes(entry.name)) {
        return {
          id: generateId(fullPath),
          name: entry.name,
          type: 'folder',
          expanded: false,
          children: [{
            id: generateId(path.join(dirPath, '...')),
            name: '...',
            type: 'file',
            content: ''
          }]
        }
      }
      return {
        id: generateId(fullPath),
        name: entry.name,
        type: 'folder',
        expanded: false,
        children: readDirToFileItems(fullPath),
      };
    } else {
      if (ignoreFiles.includes(entry.name)) {
        return undefined;
      }
      return {
        id: generateId(fullPath),
        name: entry.name,
        type: 'file',
        content: readFileSync(fullPath, 'utf-8'),
      };
    }
  }).filter((item): item is FileItem => item !== undefined);
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
  if (mcProcess !== null) return c.json({"message": "Server already started"}, 400);
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
    logBuffer.length = 0;
    mcProcess = null;
  })
  return c.json({"message": "Server started"});
})
.post('/api/v1/minecraft/stop', requireAuth, async(c) => {
  // If the server is on, stop it
  if (mcProcess === null) return c.json({"message": "Server has not started"}, 400);
  mcProcess.stdin.write("stop\n");
  mcProcess.stdin.end();
  return c.json({"message": "Server stopped"});
})
.get('/api/v1/minecraft/logs', requireAuth, upgradeWebSocket((c) => {
  const username = c.get('username');
  return {
    onOpen: (_, ws) => {
      clients.set(username, ws);
      logBuffer.forEach((line) => {
        ws.send(JSON.stringify({type: 'log', message: line}));
      })
    },
    onMessage: (event, _) => {
      if (event.data === 'frontend-ping') return;
      if (mcProcess) mcProcess.stdin.write(event.data + "\n");
    },
    onClose: () => {
      clients.delete(username);
    }
  }})
)
.get('/api/v1/minecraft/files', requireAuth, async (c) => {
  const mcDir = path.resolve('mc');
  try {
    const files = readDirToFileItems(mcDir);
    const parsedFiles = z.array(fileItemSchema).parse(files);
    return c.json(parsedFiles);
  }
  catch (err) {
    console.log(err);
    return c.json([]);
  }
})

export type MinecraftApp = typeof wsApp;
export default app;
