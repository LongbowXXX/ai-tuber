import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import WebSocket from 'ws';
import dotenv from 'dotenv';

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

// ... const definitions

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
console.log('[Main] VITE_DEV_SERVER_URL:', VITE_DEV_SERVER_URL);

export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(APP_ROOT, 'dist');

const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST;
process.env.VITE_PUBLIC = VITE_PUBLIC;

let win: BrowserWindow | null;
let ws: WebSocket | null = null;
const WS_ENDPOINT = process.env.VITE_STAGE_DIRECTER_ENDPOINT || 'ws://localhost:8080';
console.log('[Main] WS_ENDPOINT:', WS_ENDPOINT);

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
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// WebSocket Handlers
function setupWebSocketHandlers() {
  console.log('[Main] setupWebSocketHandlers called');
  ipcMain.on('socket-connect', () => {
    console.log('[Main] IPC: socket-connect received');
    // ... rest of the handler
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket is already connected or connecting.');
      return;
    }

    console.log(`Connecting to WebSocket at ${WS_ENDPOINT}...`);
    ws = new WebSocket(WS_ENDPOINT);

    ws.on('open', () => {
      console.log('WebSocket connected');
      win?.webContents.send('socket-on-open');
    });

    ws.on('message', data => {
      // console.log('Received message:', data.toString());
      win?.webContents.send('socket-on-message', data.toString());
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket disconnected: ${code} ${reason}`);
      win?.webContents.send('socket-on-close');
      ws = null;
    });

    ws.on('error', error => {
      console.error('WebSocket error:', error);
      win?.webContents.send('socket-on-error', error.message);
    });
  });

  ipcMain.on('socket-disconnect', () => {
    if (ws) {
      console.log('Disconnecting WebSocket...');
      ws.close();
      ws = null;
    }
  });

  ipcMain.on('socket-send', (_event, message: string | object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const msg = typeof message === 'string' ? message : JSON.stringify(message);
      ws.send(msg);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
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
  setupWebSocketHandlers();
  createWindow();
});
