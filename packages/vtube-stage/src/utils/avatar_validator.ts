import { z } from 'zod';

// avatars.json の各エントリが満たすべき形状。
// VRM ごとに値が変わる項目（height, voiceVoxSpeaker, lookAtConfig, blinkConfig）は
// 欠落・不正値のまま読み込まれないよう厳密にチェックする。
const AvatarConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  voiceVoxSpeaker: z.string().min(1),
  vrmUrl: z.string().min(1),
  animationUrls: z.record(z.string(), z.string()),
  currentEmotion: z.string(),
  currentAnimationName: z.string().nullable(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  height: z.number().finite().positive(),
  lookAtConfig: z.object({
    yawLimitDeg: z.number(),
    pitchLimitDeg: z.number(),
    headWeight: z.number(),
    neckWeight: z.number(),
    disableLookAtAnimations: z.array(z.string()),
  }),
  blinkConfig: z.object({
    disabledEmotions: z.array(z.string()),
  }),
  autoReturnToIdleTimeout: z.number().optional(),
});

export type ValidatedAvatarConfig = z.infer<typeof AvatarConfigSchema>;

/**
 * avatars.json からロードした配列を検証し、不正なエントリを除外する。
 * @param data avatars.json をパースした結果（unknown 前提）
 * @returns 検証を通過したアバター設定の配列
 */
export function validateAvatarConfigs(data: unknown): ValidatedAvatarConfig[] {
  if (!Array.isArray(data)) {
    console.error('avatars.json must be an array of avatar configs');
    return [];
  }

  const validAvatars: ValidatedAvatarConfig[] = [];
  for (const entry of data) {
    const result = AvatarConfigSchema.safeParse(entry);
    if (result.success) {
      validAvatars.push(result.data);
    } else {
      const id =
        typeof entry === 'object' && entry !== null && 'id' in entry ? (entry as { id: unknown }).id : '(unknown)';
      console.error(`Invalid avatar config (id=${String(id)}) in avatars.json, skipping:`, result.error.format());
    }
  }
  return validAvatars;
}
