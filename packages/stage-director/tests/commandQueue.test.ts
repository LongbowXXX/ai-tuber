//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import { describe, it, expect } from 'vitest';
import { commandQueue } from '../src/commandQueue';
import { SpeakCommand } from '../src/models';

describe('CommandQueue', () => {
  it('should enqueue and dequeue commands', async () => {
    const command: SpeakCommand = {
      command: 'speak',
      payload: {
        characterId: 'test_char',
        message: 'Hello',
        caption: 'Hello caption',
        emotion: 'happy',
        speakId: 'test-id-1',
      },
    };

    await commandQueue.enqueueCommand(command);
    const dequeuedCommand = await commandQueue.dequeueCommand();

    expect(dequeuedCommand).toEqual(command);
  });

  it('should wait for command completion', async () => {
    const commandId = 'test-wait-id';
    let completed = false;

    // Start waiting
    const waitPromise = commandQueue.waitForCommand(commandId).then(() => {
      completed = true;
    });

    // Notify completion
    setTimeout(() => {
      commandQueue.notifyCommandDone(commandId);
    }, 10);

    await waitPromise;
    expect(completed).toBe(true);
  });
});
