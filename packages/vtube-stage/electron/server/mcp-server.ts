import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema, JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'; // This might be in strict path
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { commandQueue } from './command-queue.ts';

// Manual implementation of SSEServerTransport if not available or for control
export class SSEServerTransport implements Transport {
  private res: Response;
  public sessionId: string;

  constructor(path: string, res: Response) {
    this.res = res;
    this.sessionId = uuidv4();

    // Set headers for SSE
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // Send initial endpoint event
    this.res.write(`event: endpoint\ndata: ${path}?sessionId=${this.sessionId}\n\n`);
  }

  async start(): Promise<void> {
    // No-op
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (this.res.writableEnded) return;
    this.res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
  }

  async close(): Promise<void> {
    if (!this.res.writableEnded) {
      this.res.end();
    }
  }

  // Handle incoming message from POST request
  handleMessage(message: JSONRPCMessage) {
    if (this.onmessage) {
      this.onmessage(message);
    }
  }

  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
}

export const createMcpServer = () => {
  const server = new Server(
    {
      name: 'stage-director',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'trigger_animation',
          description: 'Trigger an animation for a character',
          inputSchema: {
            type: 'object',
            properties: {
              character_id: { type: 'string' },
              animation_name: { type: 'string' },
            },
            required: ['character_id', 'animation_name'],
          },
        },
        {
          name: 'speak',
          description: 'Speak a message',
          inputSchema: {
            type: 'object',
            properties: {
              character_id: { type: 'string' },
              message: { type: 'string' },
              caption: { type: 'string' },
              emotion: { type: 'string' },
              style: { type: 'string' },
            },
            required: ['character_id', 'message', 'caption', 'emotion'],
          },
        },
        {
          name: 'display_markdown_text',
          description: 'Display Markdown text',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string' },
            },
            required: ['text'],
          },
        },
        {
          name: 'control_camera',
          description: 'Control the vtube-stage camera',
          inputSchema: {
            type: 'object',
            properties: {
              mode: { type: 'string' },
              target_id: { type: 'string', default: '' },
              duration: { type: 'number', default: 1.0 },
            },
            required: ['mode'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'trigger_animation') {
        const { character_id, animation_name } = args as { character_id: string; animation_name: string };
        commandQueue.enqueue({
          command: 'triggerAnimation',
          payload: {
            characterId: character_id,
            animationName: animation_name,
          },
        });
        return { content: [{ type: 'text', text: 'Success' }] };
      }

      if (name === 'speak') {
        const { character_id, message, caption, emotion, style } = args as {
          character_id: string;
          message: string;
          caption: string;
          emotion: string;
          style?: string;
        };
        const speakId = uuidv4();

        commandQueue.enqueue({
          command: 'speak',
          payload: {
            characterId: character_id,
            message,
            caption,
            emotion,
            style,
            speakId,
          },
        });

        await commandQueue.waitForCommand(speakId);
        return { content: [{ type: 'text', text: 'Success' }] };
      }

      if (name === 'display_markdown_text') {
        const { text } = args as { text: string };
        commandQueue.enqueue({
          command: 'displayMarkdown',
          payload: { text },
        });
        return { content: [{ type: 'text', text: 'Success' }] };
      }

      if (name === 'control_camera') {
        const { mode, target_id, duration } = args as { mode: string; target_id?: string; duration?: number };
        commandQueue.enqueue({
          command: 'controlCamera',
          payload: {
            mode,
            targetId: target_id || '',
            duration: duration ?? 1.0,
          },
        });
        return { content: [{ type: 'text', text: 'Success' }] };
      }

      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error executing tool ${name}: ${error}` }], isError: true };
    }
  });

  return server;
};
