import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Stage command interface
interface StageCommand {
  command: string;
  payload: unknown;
}

// Command events for tracking completion
const commandEvents: Map<string, () => void> = new Map();

let mainWindow: BrowserWindow | null = null;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize MCP server with HTTP/SSE transport
async function initMCPServer() {
  const server = new Server(
    {
      name: 'vtube-stage',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define MCP tools
  const tools: Tool[] = [
    {
      name: 'speak',
      description: 'Make a character speak with specified emotion and message',
      inputSchema: {
        type: 'object',
        properties: {
          character_id: {
            type: 'string',
            description: 'The ID of the character',
          },
          message: {
            type: 'string',
            description: 'The message to speak',
          },
          caption: {
            type: 'string',
            description: 'Caption text to display',
          },
          emotion: {
            type: 'string',
            description: 'The emotion for the character',
          },
          style: {
            type: 'string',
            description: 'Optional speaking style',
          },
        },
        required: ['character_id', 'message', 'caption', 'emotion'],
      },
    },
    {
      name: 'trigger_animation',
      description: 'Trigger an animation for a character',
      inputSchema: {
        type: 'object',
        properties: {
          character_id: {
            type: 'string',
            description: 'The ID of the character',
          },
          animation_name: {
            type: 'string',
            description: 'The name of the animation to trigger',
          },
        },
        required: ['character_id', 'animation_name'],
      },
    },
    {
      name: 'display_markdown_text',
      description: 'Display markdown text on the stage',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The markdown text to display',
          },
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
            description: 'Camera mode (default, intro, closeUp, fullBody, etc.)',
          },
          target_id: {
            type: 'string',
            description: 'Target character ID',
          },
          duration: {
            type: 'number',
            description: 'Transition duration in seconds',
          },
        },
        required: ['mode'],
      },
    },
  ];

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handle tool call requests
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'speak': {
          const speakId = uuidv4();
          const command: StageCommand = {
            command: 'speak',
            payload: {
              characterId: args.character_id,
              message: args.message,
              caption: args.caption,
              emotion: args.emotion,
              style: args.style || null,
              speakId,
            },
          };

          // Send command to renderer
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('stage-command', command);
          }

          // Wait for completion
          await waitForCommand(speakId);

          return {
            content: [{ type: 'text', text: 'Success' }],
          };
        }

        case 'trigger_animation': {
          const command: StageCommand = {
            command: 'triggerAnimation',
            payload: {
              characterId: args.character_id,
              animationName: args.animation_name,
            },
          };

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('stage-command', command);
          }

          return {
            content: [{ type: 'text', text: 'Success' }],
          };
        }

        case 'display_markdown_text': {
          const command: StageCommand = {
            command: 'displayMarkdown',
            payload: {
              text: args.text,
            },
          };

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('stage-command', command);
          }

          return {
            content: [{ type: 'text', text: 'Success' }],
          };
        }

        case 'control_camera': {
          const command: StageCommand = {
            command: 'controlCamera',
            payload: {
              mode: args.mode,
              targetId: args.target_id || '',
              duration: args.duration || 1.0,
            },
          };

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('stage-command', command);
          }

          return {
            content: [{ type: 'text', text: 'Success' }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  // Create Express app for SSE endpoint
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());

  // SSE endpoint
  expressApp.get('/sse', async (req, res) => {
    console.log('SSE connection established');

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const transport = new SSEServerTransport('/message', res);
    await server.connect(transport);

    // Handle client disconnect
    req.on('close', () => {
      console.log('SSE connection closed');
    });
  });

  // POST endpoint for messages
  expressApp.post('/message', async (req, res) => {
    // This endpoint is handled by the SSE transport
    res.status(202).send('Accepted');
  });

  const port = parseInt(process.env.MCP_SERVER_PORT || '8080');
  expressApp.listen(port, '0.0.0.0', () => {
    console.log(`MCP server listening on http://localhost:${port}`);
    console.log(`SSE endpoint: http://localhost:${port}/sse`);
  });
}

// Wait for a command to complete
function waitForCommand(commandId: string): Promise<void> {
  return new Promise(resolve => {
    commandEvents.set(commandId, resolve);
  });
}

// Handle speakEnd from renderer
ipcMain.on('speakEnd', (_event, speakId: string) => {
  const resolve = commandEvents.get(speakId);
  if (resolve) {
    resolve();
    commandEvents.delete(speakId);
  }
});

// App lifecycle
app.whenReady().then(async () => {
  createWindow();

  // Always initialize MCP server
  try {
    await initMCPServer();
  } catch (error) {
    console.error('Failed to initialize MCP server:', error);
  }

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
