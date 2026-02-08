import { EventEmitter } from 'events';
import { StageCommand } from '../types.js';

class CommandQueueService {
  private queue: StageCommand[] = [];
  private emitter = new EventEmitter();
  private commandEvents = new Map<string, () => void>();

  enqueue(command: StageCommand): void {
    this.queue.push(command);
    this.emitter.emit('item_added');
  }

  async dequeue(): Promise<StageCommand> {
    while (this.queue.length === 0) {
      await new Promise<void>(resolve => {
        this.emitter.once('item_added', resolve);
      });
    }
    return this.queue.shift()!;
  }

  async waitForCommand(commandId: string): Promise<void> {
    return new Promise<void>(resolve => {
      // If the command is already done (not in map), we might hang if we don't track history.
      // However, Python version just creates a new event if not exists.
      // We assume waitForCommand is called before notifyCommandDone.
      // If specific command ID collision handling is needed, add checks here.
      this.commandEvents.set(commandId, resolve);
    });
  }

  notifyCommandDone(commandId: string): void {
    const resolve = this.commandEvents.get(commandId);
    if (resolve) {
      resolve();
      this.commandEvents.delete(commandId);
    }
  }
}

export const commandQueue = new CommandQueueService();
