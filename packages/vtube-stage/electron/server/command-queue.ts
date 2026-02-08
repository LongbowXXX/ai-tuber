import { EventEmitter } from 'events';
import { StageCommand } from './types.ts';

class CommandQueueService {
  private queue: StageCommand[] = [];
  private emitter = new EventEmitter();
  // Map to store resolvers for commands that are being waited on
  private commandEvents = new Map<string, (success: boolean) => void>();
  // Set to store IDs of commands that completed before being waited on (with auto-cleanup timestamp could be better, but Set is simple for now)
  // To avoid memory leaks, we store timestamp and clean up periodically or on access
  private completedCommands = new Map<string, number>();

  private readonly TIMEOUT_MS = 30000; // 30 seconds timeout
  private readonly CLEANUP_INTERVAL_MS = 60000; // Clean up old completed commands every minute

  constructor() {
    // Periodic cleanup of completedCommands map to prevent memory leaks
    setInterval(() => this.cleanupCompletedCommands(), this.CLEANUP_INTERVAL_MS);
  }

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
    // Check if valid commandId
    if (!commandId) return;

    // 1. Check if already completed (Race condition handling: notify came before wait)
    if (this.completedCommands.has(commandId)) {
      this.completedCommands.delete(commandId);
      return Promise.resolve();
    }

    // 2. Wait for completion with timeout
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.commandEvents.has(commandId)) {
          this.commandEvents.delete(commandId);
          reject(new Error(`Command ${commandId} timed out after ${this.TIMEOUT_MS}ms`));
        }
      }, this.TIMEOUT_MS);

      this.commandEvents.set(commandId, success => {
        clearTimeout(timeoutId);
        if (success) {
          resolve();
        } else {
          reject(new Error(`Command ${commandId} failed or was cancelled`));
        }
      });
    });
  }

  notifyCommandDone(commandId: string, success: boolean = true): void {
    if (!commandId) return;

    if (this.commandEvents.has(commandId)) {
      // Someone is waiting
      const resolver = this.commandEvents.get(commandId);
      this.commandEvents.delete(commandId);
      resolver!(success);
    } else {
      // No one waiting yet, store completion (Race condition handling)
      this.completedCommands.set(commandId, Date.now());
    }
  }

  private cleanupCompletedCommands() {
    const now = Date.now();
    for (const [id, timestamp] of this.completedCommands.entries()) {
      if (now - timestamp > this.TIMEOUT_MS * 2) {
        this.completedCommands.delete(id);
      }
    }
  }
}

export const commandQueue = new CommandQueueService();
