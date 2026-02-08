import { describe, it, expect } from 'vitest';
import { commandQueue } from '../services/CommandQueue.js';
import { StageCommand } from '../types.js';

describe('CommandQueue', () => {
  it('should enqueue and dequeue commands', async () => {
    const command: StageCommand = {
      command: 'triggerAnimation',
      payload: { characterId: 'test', animationName: 'wave' },
    };

    commandQueue.enqueue(command);
    const result = await commandQueue.dequeue();
    expect(result).toEqual(command);
  });

  it('should wait for dequeue if empty', async () => {
    const command: StageCommand = {
      command: 'displayMarkdown',
      payload: { text: 'hello' },
    };

    const dequeuePromise = commandQueue.dequeue();
    setTimeout(() => commandQueue.enqueue(command), 50);

    const result = await dequeuePromise;
    expect(result).toEqual(command);
  });
});
