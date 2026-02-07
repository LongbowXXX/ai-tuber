import { app, BrowserWindow, ipcMain } from 'electron';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

// MCP Server Setup
const server = new Server(
  {
    name: 'vtube-stage-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'trigger_animation',
        description: 'Trigger an animation for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: { type: 'string', description: 'Character ID' },
            animation_name: { type: 'string', description: 'Animation name' },
          },
          required: ['character_id', 'animation_name'],
        },
      },
      {
        name: 'speak',
        description: 'Make a character speak',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: { type: 'string', description: 'Character ID' },
            message: { type: 'string', description: 'Message to speak' },
            caption: { type: 'string', description: 'Caption text' },
            emotion: { type: 'string', description: 'Emotion' },
            style: { type: 'string', description: 'Voice style (optional)' },
          },
          required: ['character_id', 'message', 'caption', 'emotion'],
        },
      },
      {
        name: 'display_markdown_text',
        description: 'Display markdown text on stage',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Markdown text to display' },
          },
          required: ['text'],
        },
      },
      {
        name: 'control_camera',
        description: 'Control the stage camera',
        inputSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['default', 'intro', 'closeUp', 'fullBody', 'lowAngle', 'highAngle', 'sideRight', 'sideLeft'],
              description: 'Camera mode',
            },
            target_id: { type: 'string', description: 'Target ID (optional)' },
            duration: { type: 'number', description: 'Duration in seconds (optional)', default: 1.0 },
          },
          required: ['mode'],
        },
      },
    ],
  };
});

// Handle tool calls and forward to renderer
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  if (!mainWindow) {
    throw new Error('Main window not available');
  }

  interface StageCommand {
    command: string;
    payload: Record<string, unknown>;
  }

  let command: StageCommand;
  let speakId: string | undefined;

  switch (name) {
    case 'trigger_animation':
      command = {
        command: 'triggerAnimation',
        payload: {
          characterId: args?.character_id,
          animationName: args?.animation_name,
        },
      };
      break;
    case 'speak':
      speakId = generateUUID();
      command = {
        command: 'speak',
        payload: {
          characterId: args?.character_id,
          message: args?.message,
          caption: args?.caption,
          emotion: args?.emotion,
          style: args?.style,
          speakId: speakId,
        },
      };
      break;
    case 'display_markdown_text':
      command = {
        command: 'displayMarkdown',
        payload: {
          text: args?.text,
        },
      };
      break;
    case 'control_camera':
      command = {
        command: 'controlCamera',
        payload: {
          mode: args?.mode,
          targetId: args?.target_id || '',
          duration: args?.duration || 1.0,
        },
      };
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  // Send command to renderer
  mainWindow.webContents.send('stage-command', command);

  // For speak command, wait for completion
  if (name === 'speak' && speakId) {
    await waitForSpeakEnd(speakId);
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Success',
      },
    ],
  };
});

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Store pending speak completions
const pendingSpeakCompletions = new Map<string, () => void>();

// Wait for speak end event
function waitForSpeakEnd(speakId: string): Promise<void> {
  return new Promise(resolve => {
    pendingSpeakCompletions.set(speakId, resolve);
  });
}

// Handle speakEnd from renderer
ipcMain.on('speakEnd', (_event, speakId: string) => {
  const resolve = pendingSpeakCompletions.get(speakId);
  if (resolve) {
    resolve();
    pendingSpeakCompletions.delete(speakId);
  }
});

// Start MCP server on stdio
async function startMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP Server started on stdio');
}

// Create Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  createWindow();
  await startMCPServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
