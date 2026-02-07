import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import * as z from 'zod';
import { app, BrowserWindow, ipcMain } from 'electron';
import type { Request, Response } from 'express';

type TriggerAnimationCommand = {
  command: 'triggerAnimation';
  payload: { characterId: string; animationName: string };
};

type SpeakCommand = {
  command: 'speak';
  payload: {
    characterId: string;
    message: string;
    caption: string;
    emotion: string;
    style?: string;
    speakId: string;
  };
};

type DisplayMarkdownCommand = {
  command: 'displayMarkdown';
  payload: { text: string };
};

type ControlCameraCommand = {
  command: 'controlCamera';
  payload: { mode: string; targetId?: string; duration?: number };
};

type StageCommand = TriggerAnimationCommand | SpeakCommand | DisplayMarkdownCommand | ControlCameraCommand;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_HOST = process.env.VTUBE_STAGE_MCP_HOST ?? '127.0.0.1';
const MCP_PORT = Number(process.env.VTUBE_STAGE_MCP_PORT ?? '8080');
const MCP_SSE_PATH = process.env.VTUBE_STAGE_MCP_SSE_PATH ?? '/sse';
const MCP_MESSAGES_PATH = process.env.VTUBE_STAGE_MCP_MESSAGES_PATH ?? '/messages';

let mainWindow: BrowserWindow | null = null;
let rendererReady = false;
const queuedCommands: StageCommand[] = [];
const pendingSpeakResolvers = new Map<string, () => void>();

function sendCommand(command: StageCommand) {
  if (mainWindow && rendererReady) {
    mainWindow.webContents.send('stage-command', command);
    return;
  }
  queuedCommands.push(command);
}

function flushQueuedCommands() {
  if (!mainWindow || !rendererReady || queuedCommands.length === 0) return;
  queuedCommands.forEach(command => mainWindow?.webContents.send('stage-command', command));
  queuedCommands.length = 0;
}

ipcMain.on('renderer-ready', () => {
  rendererReady = true;
  flushQueuedCommands();
});

ipcMain.on('speak-end', (_event, speakId: string) => {
  const resolver = pendingSpeakResolvers.get(speakId);
  if (resolver) {
    resolver();
    pendingSpeakResolvers.delete(speakId);
  }
});

function successResponse(message = 'Success'): CallToolResult {
  return {
    content: [
      {
        type: 'text' as const,
        text: message,
      },
    ],
  };
}

function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'vtube-stage',
      version: '0.1.0',
    },
    {
      capabilities: { logging: {} },
    }
  );

  server.registerTool(
    'trigger_animation',
    {
      title: 'trigger_animation',
      description: 'Trigger a VRM animation on a specific character',
      inputSchema: z.object({
        character_id: z.string().describe('Character identifier'),
        animation_name: z.string().describe('Animation name'),
      }),
    },
    async ({ character_id, animation_name }) => {
      const command: TriggerAnimationCommand = {
        command: 'triggerAnimation',
        payload: { characterId: character_id, animationName: animation_name },
      };
      sendCommand(command);
      return successResponse('Animation triggered');
    }
  );

  server.registerTool(
    'speak',
    {
      title: 'speak',
      description: 'Speak via the renderer with synced completion notification',
      inputSchema: z.object({
        character_id: z.string().describe('Character identifier'),
        message: z.string().describe('Speech text'),
        caption: z.string().describe('Caption text'),
        emotion: z.string().describe('Emotion keyword'),
        style: z.string().optional().describe('Optional voice style'),
      }),
    },
    async ({ character_id, message, caption, emotion, style }) => {
      const speakId = randomUUID();
      const command: SpeakCommand = {
        command: 'speak',
        payload: {
          characterId: character_id,
          message,
          caption,
          emotion,
          style,
          speakId,
        },
      };
      sendCommand(command);

      await new Promise<void>(resolve => {
        pendingSpeakResolvers.set(speakId, resolve);
      });

      return successResponse('Speak completed');
    }
  );

  server.registerTool(
    'display_markdown_text',
    {
      title: 'display_markdown_text',
      description: 'Render markdown text on the stage overlay',
      inputSchema: z.object({
        text: z.string().describe('Markdown body'),
      }),
    },
    async ({ text }) => {
      const command: DisplayMarkdownCommand = {
        command: 'displayMarkdown',
        payload: { text },
      };
      sendCommand(command);
      return successResponse('Markdown displayed');
    }
  );

  server.registerTool(
    'control_camera',
    {
      title: 'control_camera',
      description: 'Control the virtual camera',
      inputSchema: z.object({
        mode: z
          .string()
          .describe('Camera mode: default, intro, closeUp, fullBody, lowAngle, highAngle, sideRight, sideLeft'),
        target_id: z.string().optional().describe('Target id to focus on'),
        duration: z.number().optional().describe('Transition duration in seconds'),
      }),
    },
    async ({ mode, target_id, duration }) => {
      const command: ControlCameraCommand = {
        command: 'controlCamera',
        payload: { mode, targetId: target_id, duration },
      };
      sendCommand(command);
      return successResponse('Camera controlled');
    }
  );

  return server;
}

function startMcpServer() {
  const expressApp = createMcpExpressApp();
  const transports: Record<string, SSEServerTransport> = {};

  expressApp.get(MCP_SSE_PATH, async (_req: Request, res: Response) => {
    try {
      const transport = new SSEServerTransport(MCP_MESSAGES_PATH, res);
      transports[transport.sessionId] = transport;
      transport.onclose = () => {
        delete transports[transport.sessionId];
      };

      const server = createMcpServer();
      await server.connect(transport);
    } catch (error) {
      console.error('Failed to establish MCP SSE connection', error);
      if (!res.headersSent) {
        res.status(500).send('Failed to establish MCP SSE connection');
      }
    }
  });

  expressApp.post(MCP_MESSAGES_PATH, async (req: Request, res: Response) => {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).send('Missing sessionId parameter');
      return;
    }
    const transport = transports[sessionId];
    if (!transport) {
      res.status(404).send('Session not found');
      return;
    }

    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('Failed to handle MCP message', error);
      if (!res.headersSent) {
        res.status(500).send('Failed to handle MCP message');
      }
    }
  });

  expressApp.listen(MCP_PORT, MCP_HOST, (error?: Error) => {
    if (error) {
      console.error('Failed to start MCP server', error);
      return;
    }
    console.log(`MCP server listening at http://${MCP_HOST}:${MCP_PORT}${MCP_SSE_PATH}`);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  startMcpServer();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
