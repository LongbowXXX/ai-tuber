import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';
import { useCallback, useEffect, useRef } from 'react';

const LIPSYNC_MOUTH_LIST: VRMExpressionPresetName[] = ['aa', 'ih', 'ou', 'ee', 'oh'];

export function useFacialExpression(
  vrm: VRM | null,
  expressionWeights: Record<string, number>,
  isVoiceActive: boolean
) {
  const intervalRef = useRef<number | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!vrm || !isVoiceActive) {
      // OFF時は全ての口形状を0に
      LIPSYNC_MOUTH_LIST.forEach(name => {
        vrm?.expressionManager?.setValue(name, 0);
      });
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    // ON時: 一定間隔で口形状を切り替え
    idxRef.current = 0;
    vrm.expressionManager?.setValue(LIPSYNC_MOUTH_LIST[0], 0.5);
    intervalRef.current = setInterval(() => {
      // 全て0に
      LIPSYNC_MOUTH_LIST.forEach(name => {
        vrm.expressionManager?.setValue(name, 0);
      });
      // 次の口形状だけ1.0
      idxRef.current = (idxRef.current + 1) % LIPSYNC_MOUTH_LIST.length;
      vrm.expressionManager?.setValue(LIPSYNC_MOUTH_LIST[idxRef.current], 0.5);
    }, 120);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      // OFF時は全ての口形状を0に
      LIPSYNC_MOUTH_LIST.forEach(name => {
        vrm?.expressionManager?.setValue(name, 0);
      });
    };
  }, [vrm, isVoiceActive]);

  // --- Expression Update ---
  const updateExpressions = useCallback(() => {
    if (!vrm) return;
    if (!vrm?.expressionManager) return;
    Object.entries(expressionWeights).forEach(([name, weight]) => {
      try {
        if (vrm.expressionManager?.getExpression(name as VRMExpressionPresetName)) {
          vrm.expressionManager.setValue(name as VRMExpressionPresetName, weight);
        }
      } catch (error) {
        console.warn(`Failed to set expression ${name}`, error);
      }
    });
  }, [vrm, expressionWeights]);
  return { updateExpressions };
}
