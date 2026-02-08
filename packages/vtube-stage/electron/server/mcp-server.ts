import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { commandQueue } from './command-queue.ts';
import { z } from 'zod';

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

    // Handle SSE close
    this.res.on('close', () => {
      console.log(`SSE connection closed by client: ${this.sessionId}`);
      this.onclose?.();
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
  const server = new McpServer(
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

  server.registerTool(
    'trigger_animation',
    {
      description:
        'Trigger an animation for a character. Valid animations: "wave", "agree", "no", "fear", "victory", "punch".',
      inputSchema: {
        character_id: z.string(),
        animation_name: z
          .enum(['wave', 'agree', 'no', 'fear', 'victory', 'punch'])
          .describe('The name of the animation to trigger ("wave", "agree", "no", "fear", "victory", "punch")'),
      },
    },
    async ({ character_id, animation_name }) => {
      commandQueue.enqueue({
        command: 'triggerAnimation',
        payload: {
          characterId: character_id,
          animationName: animation_name,
        },
      });
      return { content: [{ type: 'text', text: 'Success' }] };
    }
  );

  server.registerTool(
    'speak',
    {
      description: 'Speak a message',
      inputSchema: {
        character_id: z.string(),
        message: z.string(),
        caption: z.string(),
        emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'relaxed', 'surprised']),
        style: z.enum(['ノーマル', 'あまあま', 'ツンツン', 'セクシー', 'ささやき', 'ヒソヒソ']).optional(),
      },
    },
    async ({ character_id, message, caption, emotion, style }) => {
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

      try {
        await commandQueue.waitForCommand(speakId);
        return { content: [{ type: 'text', text: 'Success' }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'display_markdown_text',
    {
      description: 'Display Markdown text',
      inputSchema: {
        text: z.string(),
      },
    },
    async ({ text }) => {
      commandQueue.enqueue({
        command: 'displayMarkdown',
        payload: { text },
      });
      return { content: [{ type: 'text', text: 'Success' }] };
    }
  );

  server.registerTool(
    'control_camera',
    {
      description:
        'Control the vtube-stage camera. \n\nArgs:\n  mode: The camera mode ("default", "intro", "closeUp", "fullBody", "lowAngle", "highAngle", "sideRight", "sideLeft").\n  target_id: The ID of the target to focus on (optional).\n  duration: The duration of the camera transition in seconds (default: 1.0).',
      inputSchema: {
        mode: z
          .enum(['default', 'intro', 'closeUp', 'fullBody', 'lowAngle', 'highAngle', 'sideRight', 'sideLeft'])
          .describe(
            'The camera mode ("default", "intro", "closeUp", "fullBody", "lowAngle", "highAngle", "sideRight", "sideLeft")'
          ),
        target_id: z.string().optional().describe('The ID of the target to focus on (optional)'),
        duration: z.number().default(1.0).describe('The duration of the camera transition in seconds (default: 1.0)'),
      },
    },
    async ({ mode, target_id, duration }) => {
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
  );

  return server.server;
};
