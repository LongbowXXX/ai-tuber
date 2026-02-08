import { z } from 'zod';

export const TriggerAnimationPayloadSchema = z.object({
  characterId: z.string(),
  animationName: z.string(),
});
export type TriggerAnimationPayload = z.infer<typeof TriggerAnimationPayloadSchema>;

export const SpeakPayloadSchema = z.object({
  characterId: z.string(),
  message: z.string(),
  caption: z.string(),
  emotion: z.string(),
  style: z.string().optional(),
  speakId: z.string(),
});
export type SpeakPayload = z.infer<typeof SpeakPayloadSchema>;

export const SpeakEndPayloadSchema = z.object({
  speakId: z.string(),
});
export type SpeakEndPayload = z.infer<typeof SpeakEndPayloadSchema>;

export const DisplayMarkdownTextPayloadSchema = z.object({
  text: z.string(),
});
export type DisplayMarkdownTextPayload = z.infer<typeof DisplayMarkdownTextPayloadSchema>;

// Commands

export const TriggerAnimationCommandSchema = z.object({
  command: z.literal('triggerAnimation'),
  payload: TriggerAnimationPayloadSchema,
});
export type TriggerAnimationCommand = z.infer<typeof TriggerAnimationCommandSchema>;

export const SpeakCommandSchema = z.object({
  command: z.literal('speak'),
  payload: SpeakPayloadSchema,
});
export type SpeakCommand = z.infer<typeof SpeakCommandSchema>;

export const SpeakEndCommandSchema = z.object({
  command: z.literal('speakEnd'),
  payload: SpeakEndPayloadSchema,
});
export type SpeakEndCommand = z.infer<typeof SpeakEndCommandSchema>;

export const DisplayMarkdownTextCommandSchema = z.object({
  command: z.literal('displayMarkdown'),
  payload: DisplayMarkdownTextPayloadSchema,
});
export type DisplayMarkdownTextCommand = z.infer<typeof DisplayMarkdownTextCommandSchema>;

export const ControlCameraPayloadSchema = z.object({
  mode: z.string(),
  targetId: z.string().default(''),
  duration: z.number().default(1.0),
});
export type ControlCameraPayload = z.infer<typeof ControlCameraPayloadSchema>;

export const ControlCameraCommandSchema = z.object({
  command: z.literal('controlCamera'),
  payload: ControlCameraPayloadSchema,
});
export type ControlCameraCommand = z.infer<typeof ControlCameraCommandSchema>;

export const StageCommandSchema = z.discriminatedUnion('command', [
  TriggerAnimationCommandSchema,
  SpeakCommandSchema,
  SpeakEndCommandSchema,
  DisplayMarkdownTextCommandSchema,
  ControlCameraCommandSchema,
]);
export type StageCommand = z.infer<typeof StageCommandSchema>;
