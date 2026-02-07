//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import { z } from 'zod';

// Payload schemas
export const TriggerAnimationPayloadSchema = z.object({
  characterId: z.string(),
  animationName: z.string(),
});

export const SpeakPayloadSchema = z.object({
  characterId: z.string(),
  message: z.string(),
  caption: z.string(),
  emotion: z.string(),
  style: z.string().optional(),
  speakId: z.string(),
});

export const SpeakEndPayloadSchema = z.object({
  speakId: z.string(),
});

export const DisplayMarkdownTextPayloadSchema = z.object({
  text: z.string(),
});

export const ControlCameraPayloadSchema = z.object({
  mode: z.string(),
  targetId: z.string().default(''),
  duration: z.number().default(1.0),
});

// Command schemas
export const TriggerAnimationCommandSchema = z.object({
  command: z.literal('triggerAnimation'),
  payload: TriggerAnimationPayloadSchema,
});

export const SpeakCommandSchema = z.object({
  command: z.literal('speak'),
  payload: SpeakPayloadSchema,
});

export const SpeakEndCommandSchema = z.object({
  command: z.literal('speakEnd'),
  payload: SpeakEndPayloadSchema,
});

export const DisplayMarkdownTextCommandSchema = z.object({
  command: z.literal('displayMarkdown'),
  payload: DisplayMarkdownTextPayloadSchema,
});

export const ControlCameraCommandSchema = z.object({
  command: z.literal('controlCamera'),
  payload: ControlCameraPayloadSchema,
});

export const StageCommandSchema = z.union([
  TriggerAnimationCommandSchema,
  SpeakCommandSchema,
  SpeakEndCommandSchema,
  DisplayMarkdownTextCommandSchema,
  ControlCameraCommandSchema,
]);

// TypeScript types
export type TriggerAnimationPayload = z.infer<typeof TriggerAnimationPayloadSchema>;
export type SpeakPayload = z.infer<typeof SpeakPayloadSchema>;
export type SpeakEndPayload = z.infer<typeof SpeakEndPayloadSchema>;
export type DisplayMarkdownTextPayload = z.infer<typeof DisplayMarkdownTextPayloadSchema>;
export type ControlCameraPayload = z.infer<typeof ControlCameraPayloadSchema>;

export type TriggerAnimationCommand = z.infer<typeof TriggerAnimationCommandSchema>;
export type SpeakCommand = z.infer<typeof SpeakCommandSchema>;
export type SpeakEndCommand = z.infer<typeof SpeakEndCommandSchema>;
export type DisplayMarkdownTextCommand = z.infer<typeof DisplayMarkdownTextCommandSchema>;
export type ControlCameraCommand = z.infer<typeof ControlCameraCommandSchema>;

export type StageCommand = z.infer<typeof StageCommandSchema>;

// Helper function to create command JSON
export function createCommandJson(command: StageCommand): string {
  return JSON.stringify(command);
}
