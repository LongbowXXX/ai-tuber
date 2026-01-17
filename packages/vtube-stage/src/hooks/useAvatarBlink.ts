import { useCallback, useRef } from 'react';
import { VRM } from '@pixiv/three-vrm';

export const useAvatarBlink = (vrm: VRM | null, currentEmotion: string) => {
  const blinkTimerRef = useRef<number>(Math.random() * 2 + 1); // 瞬きタイマー
  const isBlinkingRef = useRef<boolean>(false);
  const blinkProgressRef = useRef<number>(0);

  const updateBlink = useCallback(
    (delta: number) => {
      if (!vrm || !vrm.expressionManager) return;

      if (currentEmotion === 'happy') {
        // happyのときは瞬きしない（笑顔で目が細くなっているため干渉を防ぐ）
        vrm.expressionManager.setValue('blink', 0);
        // 次の瞬きまでの時間をリセット
        blinkTimerRef.current = Math.random() * 2 + 1;
      } else {
        // happy以外のときはランダムに瞬き
        if (blinkTimerRef.current > 0) {
          blinkTimerRef.current -= delta;
          vrm.expressionManager.setValue('blink', 0); // 待機中は0
        } else {
          // 瞬き開始
          if (!isBlinkingRef.current) {
            isBlinkingRef.current = true;
            blinkProgressRef.current = 0;
          }

          blinkProgressRef.current += delta;
          // 瞬きアニメーション (閉じる -> 開く) Total 0.2sくらい
          const BLINK_DURATION = 0.2;
          if (blinkProgressRef.current < BLINK_DURATION) {
            // 0.0 -> 0.1 (閉じ) -> 0.2 (開き)
            // 0.1の時点で1.0(完閉)になるように
            let weight = 0;
            if (blinkProgressRef.current < BLINK_DURATION / 2) {
              // 閉じていく
              weight = blinkProgressRef.current / (BLINK_DURATION / 2);
            } else {
              // 開いていく
              weight = 1 - (blinkProgressRef.current - BLINK_DURATION / 2) / (BLINK_DURATION / 2);
            }
            vrm.expressionManager.setValue('blink', Math.min(1.0, Math.max(0, weight)));
          } else {
            // 瞬き完了
            isBlinkingRef.current = false;
            vrm.expressionManager.setValue('blink', 0);
            // 次の瞬き時間をセット (2~6秒後)
            blinkTimerRef.current = Math.random() * 4 + 2;
          }
        }
      }
    },
    [vrm, currentEmotion]
  );

  return { updateBlink };
};
