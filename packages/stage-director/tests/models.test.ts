//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import { describe, it, expect } from 'vitest';
import {
  TriggerAnimationCommandSchema,
  SpeakCommandSchema,
  DisplayMarkdownTextCommandSchema,
  ControlCameraCommandSchema,
  createCommandJson,
} from '../src/models';

describe('Models', () => {
  it('should validate TriggerAnimationCommand', () => {
    const command = {
      command: 'triggerAnimation',
      payload: {
        characterId: 'char1',
        animationName: 'wave',
      },
    };

    const result = TriggerAnimationCommandSchema.parse(command);
    expect(result).toEqual(command);
  });

  it('should validate SpeakCommand', () => {
    const command = {
      command: 'speak',
      payload: {
        characterId: 'char1',
        message: 'Hello',
        caption: 'Greeting',
        emotion: 'happy',
        style: 'cheerful',
        speakId: 'speak-1',
      },
    };

    const result = SpeakCommandSchema.parse(command);
    expect(result).toEqual(command);
  });

  it('should validate SpeakCommand without style', () => {
    const command = {
      command: 'speak',
      payload: {
        characterId: 'char1',
        message: 'Hello',
        caption: 'Greeting',
        emotion: 'neutral',
        speakId: 'speak-2',
      },
    };

    const result = SpeakCommandSchema.parse(command);
    expect(result.payload.style).toBeUndefined();
  });

  it('should validate DisplayMarkdownTextCommand', () => {
    const command = {
      command: 'displayMarkdown',
      payload: {
        text: '# Hello World',
      },
    };

    const result = DisplayMarkdownTextCommandSchema.parse(command);
    expect(result).toEqual(command);
  });

  it('should validate ControlCameraCommand', () => {
    const command = {
      command: 'controlCamera',
      payload: {
        mode: 'closeUp',
        targetId: 'char1',
        duration: 2.0,
      },
    };

    const result = ControlCameraCommandSchema.parse(command);
    expect(result).toEqual(command);
  });

  it('should create command JSON', () => {
    const command = {
      command: 'speak' as const,
      payload: {
        characterId: 'char1',
        message: 'Hello',
        caption: 'Greeting',
        emotion: 'happy',
        speakId: 'speak-1',
      },
    };

    const json = createCommandJson(command);
    expect(JSON.parse(json)).toEqual(command);
  });
});
