//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';
import { commandQueue } from './commandQueue.js';
import { TriggerAnimationCommand, SpeakCommand, DisplayMarkdownTextCommand, ControlCameraCommand } from './models.js';

export class StageDirectorMCPServer {
  private server: Server;
  private logger: typeof console;

  constructor(logger: typeof console = console) {
    this.logger = logger;
    this.server = new Server(
      {
        name: 'stage-director',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'trigger_animation':
            return await this.handleTriggerAnimation(args);
          case 'speak':
            return await this.handleSpeak(args);
          case 'display_markdown_text':
            return await this.handleDisplayMarkdownText(args);
          case 'control_camera':
            return await this.handleControlCamera(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
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
        name: 'speak',
        description: 'Make a character speak with emotion and caption',
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
              description: 'The caption to display',
            },
            emotion: {
              type: 'string',
              description: 'The emotion to express',
            },
            style: {
              type: 'string',
              description: 'Optional style for the speech',
            },
          },
          required: ['character_id', 'message', 'caption', 'emotion'],
        },
      },
      {
        name: 'display_markdown_text',
        description: 'Display Markdown text on stage',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The Markdown text to display',
            },
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
            mode: {
              type: 'string',
              description:
                'The camera mode (default, intro, closeUp, fullBody, lowAngle, highAngle, sideRight, sideLeft)',
            },
            target_id: {
              type: 'string',
              description: 'The ID of the target to focus on (optional)',
            },
            duration: {
              type: 'number',
              description: 'The duration of the camera transition in seconds',
            },
          },
          required: ['mode'],
        },
      },
    ];
  }

  private async handleTriggerAnimation(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> {
    const { character_id, animation_name } = args as {
      character_id: string;
      animation_name: string;
    };

    this.logger.log(
      `MCP Tool 'trigger_animation' called: character_id=${character_id}, animation_name=${animation_name}`
    );

    const command: TriggerAnimationCommand = {
      command: 'triggerAnimation',
      payload: {
        characterId: character_id,
        animationName: animation_name,
      },
    };

    await commandQueue.enqueueCommand(command);
    return {
      content: [{ type: 'text', text: 'Success' }],
    };
  }

  private async handleSpeak(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> {
    const { character_id, message, caption, emotion, style } = args as {
      character_id: string;
      message: string;
      caption: string;
      emotion: string;
      style?: string;
    };

    const speakId = uuidv4();

    this.logger.log(
      `MCP Tool 'speak' called: character_id=${character_id}, message=${message}, emotion=${emotion}, speakId=${speakId}`
    );

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

    await commandQueue.enqueueCommand(command);
    await commandQueue.waitForCommand(speakId);

    return {
      content: [{ type: 'text', text: 'Success' }],
    };
  }

  private async handleDisplayMarkdownText(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> {
    const { text } = args as { text: string };

    this.logger.log(`MCP Tool 'display_markdown_text' called: text=${text}`);

    const command: DisplayMarkdownTextCommand = {
      command: 'displayMarkdown',
      payload: { text },
    };

    await commandQueue.enqueueCommand(command);
    return {
      content: [{ type: 'text', text: 'Success' }],
    };
  }

  private async handleControlCamera(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> {
    const {
      mode,
      target_id = '',
      duration = 1.0,
    } = args as {
      mode: string;
      target_id?: string;
      duration?: number;
    };

    this.logger.log(`MCP Tool 'control_camera' called: mode=${mode}, target_id=${target_id}, duration=${duration}`);

    const command: ControlCameraCommand = {
      command: 'controlCamera',
      payload: {
        mode,
        targetId: target_id,
        duration,
      },
    };

    await commandQueue.enqueueCommand(command);
    return {
      content: [{ type: 'text', text: 'Success' }],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.log('Stage Director MCP Server running on stdio');
  }
}
