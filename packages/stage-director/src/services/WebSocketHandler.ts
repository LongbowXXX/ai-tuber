import { WebSocket, WebSocketServer } from 'ws';
import { commandQueue } from './CommandQueue.js';
import { SpeakEndCommandSchema } from '../types.js';

export class WebSocketHandler {
  constructor(private wss: WebSocketServer) {
    this.wss.on('connection', ws => this.handleConnection(ws));
  }

  private handleConnection(ws: WebSocket) {
    console.log('WebSocket connection established');

    const sendLoop = async () => {
      try {
        while (ws.readyState === WebSocket.OPEN) {
          const command = await commandQueue.dequeue();

          if (ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket closed before sending command, command lost:', command);
            break;
          }

          console.log(`Sending command to client: ${JSON.stringify(command)}`);
          ws.send(JSON.stringify(command));
        }
      } catch (error) {
        console.error('Error in send loop:', error);
      }
    };

    sendLoop();

    ws.on('message', data => {
      try {
        const rawMessage = data.toString();
        const message = JSON.parse(rawMessage);
        console.log(`Received message: ${rawMessage}`);

        if (message.command === 'speakEnd') {
          const parseResult = SpeakEndCommandSchema.safeParse(message);
          if (parseResult.success) {
            console.log(`Handling speakEnd command for speakId: ${parseResult.data.payload.speakId}`);
            commandQueue.notifyCommandDone(parseResult.data.payload.speakId);
          } else {
            console.warn('Invalid speakEnd command structure:', parseResult.error);
          }
        }
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    ws.on('error', error => {
      console.error('WebSocket error:', error);
    });
  }
}
