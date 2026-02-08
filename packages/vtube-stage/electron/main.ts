import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createMcpServer, SSEServerTransport } from './server/mcp-server.ts';
import { IPCHandler } from './server/ipc-handler.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─ dist
// │ └── index.html
// ├── dist-electron
// │ ├── main.js
// │ └── preload.js
//
process.env.APP_ROOT = path.join(__dirname, '..');
const APP_ROOT = process.env.APP_ROOT;

// Load .env file
dotenv.config({ path: path.join(APP_ROOT, '.env') });

console.log('[Main] Script execution started');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
console.log('[Main] VITE_DEV_SERVER_URL:', VITE_DEV_SERVER_URL);

export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(APP_ROOT, 'dist');

const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST;
process.env.VITE_PUBLIC = VITE_PUBLIC;

let win: BrowserWindow | null;
// let ws: WebSocket | null = null; // Removed WebSocket
// const WS_ENDPOINT = process.env.VITE_STAGE_DIRECTER_ENDPOINT || 'ws://localhost:8080'; // Removed

function createWindow() {
  console.log('[Main] createWindow called');
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(VITE_PUBLIC, 'vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    console.log('[Main] did-finish-load');
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Main] did-fail-load:', errorCode, errorDescription);
  });

  if (VITE_DEV_SERVER_URL) {
    console.log('[Main] Loading URL:', VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools(); // Open DevTools for debugging
  } else {
    console.log('[Main] Loading File:', path.join(RENDERER_DIST, 'index.html'));
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // Initialize IPC Handler for Stage commands
  new IPCHandler(win);
}

// Start MCP Server
async function startMcpServer() {
  const mcpApp = express();
  const mcpPort = parseInt(process.env.STAGE_DIRECTOR_MCP_PORT || '8080', 10);
  const mcpHost = process.env.STAGE_DIRECTOR_MCP_HOST || '0.0.0.0';

  mcpApp.use(cors());
  mcpApp.use(express.json());

  const transports = new Map<string, SSEServerTransport>();

  mcpApp.get('/sse', async (_req, res) => {
    console.log('New SSE connection established');
    const mcpServer = createMcpServer();
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);

    // Clean up on close
    transport.onclose = () => {
      console.log(`SSE connection closed: ${transport.sessionId}`);
      transports.delete(transport.sessionId);
    };

    await mcpServer.connect(transport);
  });

  mcpApp.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    if (!transport) {
      console.warn(`Session not found: ${sessionId}`);
      res.status(404).send('Session not found');
      return;
    }

    try {
      await transport.handleMessage(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error(`Error handling message: ${error}`);
      res.status(500).send(String(error));
    }
  });

  mcpApp.listen(mcpPort, mcpHost, () => {
    console.log(`MCP Server running on ${mcpHost}:${mcpPort} (SSE)`);
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  startMcpServer();
  createWindow();
});
