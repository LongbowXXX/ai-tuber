import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// カメラアニメーションのデフォルト所要時間（秒）
const DEFAULT_DURATION = 1.0;
// デフォルト (定位置)
const DEFAULT_POS = new THREE.Vector3(0, 1.2, 3);
const DEFAULT_LOOKAT = new THREE.Vector3(0, 1, 0);

// Intro (上空)
const INTRO_START_POS = new THREE.Vector3(0, 5, 10);

interface CameraState {
  mode: string;
  targetId?: string;
  targetPosition?: [number, number, number]; // ターゲットアバターの位置
  duration?: number;
  timestamp: number; // 更新検知用
}

export const AnimatedCamera: React.FC<{ cameraState: CameraState | null }> = ({ cameraState }) => {
  const { camera } = useThree();
  const [animating, setAnimating] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const startPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const startLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const durationRef = useRef(DEFAULT_DURATION);

  const lastTimestampRef = useRef<number>(0);

  // カメラ状態が更新されたらアニメーション開始
  useEffect(() => {
    if (!cameraState) return;
    if (cameraState.timestamp === lastTimestampRef.current) return;
    lastTimestampRef.current = cameraState.timestamp;

    console.log('Camera state updated:', cameraState);

    // 現在のカメラ位置・視点を開始点とする
    startPosRef.current.copy(camera.position);
    // カメラの向いている方向を取得 (概略)
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    startLookAtRef.current.copy(camera.position).add(direction);

    // モードに応じた目標位置・視点設定
    durationRef.current = cameraState.duration || DEFAULT_DURATION;

    switch (cameraState.mode) {
      case 'intro':
        // Intro: 上空から定位置へ (仕様変更: 現在位置から定位置へ動くか、一度上空に飛ぶか。ここでは要望通り上空から定位置へ)
        // ただし、アニメーションとして「上空セット -> 定位置へ」なのか「現在地 -> 定位置」なのか。
        // Issueの記述「ズームアウトからのイン」など演出。
        // 実装プランに従い: 上空(START) -> 定位置(END) への移動を行う
        // ※ 瞬間移動を伴うため、現在位置からの補間ではなく、一度リセットする挙動になる
        startPosRef.current.copy(INTRO_START_POS);
        targetPosRef.current.copy(DEFAULT_POS);
        targetLookAtRef.current.copy(DEFAULT_LOOKAT);

        // 瞬間移動させる
        camera.position.copy(INTRO_START_POS);
        camera.lookAt(DEFAULT_LOOKAT);
        break;

      case 'closeUp':
        if (cameraState.targetPosition) {
          const [tx, , tz] = cameraState.targetPosition;

          // ターゲットの少し前、少し上
          // 顔の高さ(約1.4mと仮定)に合わせて調整
          // VRM原点は足元。顔はY=1.3~1.5くらい。

          // カメラ位置: ターゲットの正面 0.6m, 高さ 1.4m
          targetPosRef.current.set(tx, 1.4, tz + 0.7);
          targetLookAtRef.current.set(tx, 1.35, tz); // 顔を見る
        } else {
          // ターゲットなしならデフォルトへ
          targetPosRef.current.copy(DEFAULT_POS);
          targetLookAtRef.current.copy(DEFAULT_LOOKAT);
        }
        break;

      case 'default':
      default:
        targetPosRef.current.copy(DEFAULT_POS);
        targetLookAtRef.current.copy(DEFAULT_LOOKAT);
        break;
    }

    startTimeRef.current = null; // 次のフレームで開始時刻設定
    setAnimating(true);
  }, [cameraState, camera]);

  useFrame(() => {
    if (!animating) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      return;
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const t = Math.min(elapsed / durationRef.current, 1);

    // Easing (SmoothStep)
    // t * t * (3 - 2 * t)
    const smoothT = t * t * (3 - 2 * t);

    camera.position.lerpVectors(startPosRef.current, targetPosRef.current, smoothT);

    // LookAtの補間は難しい (Quaternion slerpが良い) が、簡易的にターゲット位置をLerpしてLookAtする
    // 現在のLookAtターゲット
    const currentLookAt = new THREE.Vector3().lerpVectors(startLookAtRef.current, targetLookAtRef.current, smoothT);
    camera.lookAt(currentLookAt);

    if (t >= 1) {
      setAnimating(false);
      // 念のため最終位置合わせ
      camera.position.copy(targetPosRef.current);
      camera.lookAt(targetLookAtRef.current);
    }
  });

  return null;
};
