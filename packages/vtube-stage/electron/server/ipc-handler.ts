import { BrowserWindow, ipcMain } from 'electron';
import { commandQueue } from './command-queue.ts';
import { SpeakEndCommandSchema } from './types.ts';

export class IPCHandler {
  constructor(private win: BrowserWindow) {
    this.setupHandlers();
    this.startCommandLoop();
  }

  private setupHandlers() {
    console.log('[IPCHandler] Setting up IPC handlers');

    // Handle speakEnd from renderer
    ipcMain.on('socket-send', (_event, message: string | object) => {
      try {
        const msgObj = typeof message === 'string' ? JSON.parse(message) : message;

        if (msgObj.command === 'speakEnd') {
          const parseResult = SpeakEndCommandSchema.safeParse(msgObj);
          if (parseResult.success) {
            console.log(`[IPCHandler] Received speakEnd for speakId: ${parseResult.data.payload.speakId}`);
            commandQueue.notifyCommandDone(parseResult.data.payload.speakId);
          } else {
            console.warn('[IPCHandler] Invalid speakEnd command:', parseResult.error);
          }
        }
      } catch (error) {
        console.error('[IPCHandler] Error processing socket-send:', error);
      }
    });

    // Handle connect/disconnect (mostly no-ops now as we are always connected via IPC)
    ipcMain.on('socket-connect', () => {
      console.log('[IPCHandler] Renderer requested connection. Sending on-open.');
      this.win.webContents.send('socket-on-open');
    });

    ipcMain.on('socket-disconnect', () => {
      console.log('[IPCHandler] Renderer requested disconnection. Sending on-close.');
      this.win.webContents.send('socket-on-close');
    });
  }

  private startCommandLoop() {
    const loop = async () => {
      try {
        while (true) {
          const command = await commandQueue.dequeue();

          if (this.win.isDestroyed()) {
            console.log('[IPCHandler] Window destroyed, stopping command loop');
            break;
          }

          console.log(`[IPCHandler] Sending command to renderer: ${JSON.stringify(command)}`);
          this.win.webContents.send('socket-on-message', JSON.stringify(command));
        }
      } catch (error) {
        console.error('[IPCHandler] Error in command loop:', error);
        // Restart loop if it crashes? Or just log and exit?
        // For now, let's try to restart after a delay to avoid busy loop
        setTimeout(() => this.startCommandLoop(), 1000);
      }
    };

    loop();
  }
}
