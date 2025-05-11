import { useEffect, useRef } from 'react';
import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';

const LIPSYNC_MOUTH_LIST: VRMExpressionPresetName[] = ['aa', 'ih', 'ou', 'ee', 'oh'];

/**
 * 疑似リップシンク用カスタムフック
 * @param vrm VRMインスタンス
 * @param isActive trueでリップシンクON
 */
export function usePseudoLipSync(vrm: VRM | null, isActive: boolean) {
  const intervalRef = useRef<number | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!vrm || !isActive) {
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
    vrm.expressionManager?.setValue(LIPSYNC_MOUTH_LIST[0], 1.0);
    intervalRef.current = setInterval(() => {
      // 全て0に
      LIPSYNC_MOUTH_LIST.forEach(name => {
        vrm.expressionManager?.setValue(name, 0);
      });
      // 次の口形状だけ1.0
      idxRef.current = (idxRef.current + 1) % LIPSYNC_MOUTH_LIST.length;
      vrm.expressionManager?.setValue(LIPSYNC_MOUTH_LIST[idxRef.current], 1.0);
    }, 120);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      // OFF時は全ての口形状を0に
      LIPSYNC_MOUTH_LIST.forEach(name => {
        vrm?.expressionManager?.setValue(name, 0);
      });
    };
  }, [vrm, isActive]);
}
