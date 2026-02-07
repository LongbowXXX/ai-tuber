//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import { StageCommand } from './models.js';

// Application-wide shared command queue
class CommandQueue {
  private queue: StageCommand[] = [];
  private waiters: Array<() => void> = [];
  private commandEvents: Map<string, () => void> = new Map();

  async enqueueCommand(command: StageCommand): Promise<void> {
    this.queue.push(command);
    if (this.waiters.length > 0) {
      const resolve = this.waiters.shift();
      if (resolve) {
        resolve();
      }
    }
  }

  async dequeueCommand(): Promise<StageCommand> {
    if (this.queue.length > 0) {
      const command = this.queue.shift();
      if (command) {
        return command;
      }
    }

    return new Promise((resolve) => {
      this.waiters.push(() => {
        const command = this.queue.shift();
        if (command) {
          resolve(command);
        }
      });
    });
  }

  async waitForCommand(commandId: string): Promise<void> {
    return new Promise((resolve) => {
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

export const commandQueue = new CommandQueue();
