//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import WebSocket, { WebSocketServer } from 'ws';
import { createCommandJson, SpeakEndCommandSchema } from './models.js';
import { commandQueue } from './commandQueue.js';

export class StageDirectorWebSocketServer {
  private wss: WebSocketServer;
  private logger: typeof console;

  constructor(port: number, host: string, logger: typeof console = console) {
    this.logger = logger;
    this.wss = new WebSocketServer({ port, host });
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      this.logger.log(`WebSocket connection established`);
      this.handleConnection(ws);
    });

    this.wss.on('error', (error: Error) => {
      this.logger.error('WebSocket server error:', error);
    });
  }

  private async handleConnection(ws: WebSocket): Promise<void> {
    let isProcessing = true;

    // Start processing command queue
    const processQueue = async (): Promise<void> => {
      try {
        while (isProcessing && ws.readyState === WebSocket.OPEN) {
          const command = await commandQueue.dequeueCommand();
          const commandJson = createCommandJson(command);
          this.logger.log(`Sending command to client: ${commandJson}`);
          ws.send(commandJson);
        }
      } catch (error) {
        this.logger.error('Error while processing command queue:', error);
      }
    };

    // Start queue processing
    const queueTask = processQueue();

    // Handle incoming messages
    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.logger.log(`Received message from client: ${JSON.stringify(message)}`);

        const { command } = message;
        if (command === 'speakEnd') {
          const speakEnd = SpeakEndCommandSchema.parse(message);
          this.logger.log(`Handling speakEnd command: ${JSON.stringify(speakEnd)}`);
          commandQueue.notifyCommandDone(speakEnd.payload.speakId);
        }
      } catch (error) {
        this.logger.error('Failed to process message:', error);
      }
    });

    ws.on('close', () => {
      this.logger.log('WebSocket connection closed');
      isProcessing = false;
    });

    ws.on('error', (error: Error) => {
      this.logger.error('WebSocket error:', error);
      isProcessing = false;
    });

    // Wait for queue processing to complete or connection to close
    await queueTask;
  }

  close(): void {
    this.wss.close();
  }
}
