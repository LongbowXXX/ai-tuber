import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// カメラアニメーションのデフォルト所要時間（秒）
const DEFAULT_DURATION = 1.0;
// デフォルト (定位置)
const DEFAULT_POS = new THREE.Vector3(0, 1.2, 3);
const DEFAULT_LOOKAT = new THREE.Vector3(0, 1, 0);
const DEFAULT_FOV = 50;

// Intro (上空)
const INTRO_START_POS = new THREE.Vector3(0, 5, 10);

// CloseUp 設定
const CLOSEUP_FOV = 40; // ズームイン時のFOV（狭い = ズーム）

interface CameraState {
  mode: string;
  targetId?: string;
  targetPosition?: [number, number, number]; // ターゲットアバターの位置
  targetHeight?: number; // ターゲットアバターの身長（または高さ）
  duration?: number;
  timestamp: number; // 更新検知用
}

export const AnimatedCamera: React.FC<{ cameraState: CameraState | null }> = ({ cameraState }) => {
  const { camera, controls } = useThree();
  const [animating, setAnimating] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const startPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const startLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const durationRef = useRef(DEFAULT_DURATION);

  // FOV アニメーション用
  const startFovRef = useRef<number>(DEFAULT_FOV);
  const targetFovRef = useRef<number>(DEFAULT_FOV);

  const lastTimestampRef = useRef<number>(0);

  // OrbitControls への参照を取得
  const getOrbitControls = (): OrbitControlsImpl | null => {
    if (controls && controls instanceof OrbitControlsImpl) {
      return controls;
    }
    return null;
  };

  // カメラ状態が更新されたらアニメーション開始
  useEffect(() => {
    if (!cameraState) return;
    if (cameraState.timestamp === lastTimestampRef.current) return;
    lastTimestampRef.current = cameraState.timestamp;

    console.log('Camera state updated:', cameraState);

    const orbitControls = getOrbitControls();

    // アニメーション開始時に OrbitControls を無効化
    if (orbitControls) {
      orbitControls.enabled = false;
    }

    // 現在のカメラ位置・視点を開始点とする
    startPosRef.current.copy(camera.position);

    // OrbitControls がある場合はそのターゲットを使用、なければカメラの向きから計算
    if (orbitControls) {
      startLookAtRef.current.copy(orbitControls.target);
    } else {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      startLookAtRef.current.copy(camera.position).add(direction);
    }

    // 現在のFOVを保存
    if (camera instanceof THREE.PerspectiveCamera) {
      startFovRef.current = camera.fov;
    }

    // モードに応じた目標位置・視点設定
    durationRef.current = cameraState.duration || DEFAULT_DURATION;

    switch (cameraState.mode) {
      case 'intro':
        // Intro: 上空から定位置へ
        startPosRef.current.copy(INTRO_START_POS);
        startLookAtRef.current.copy(DEFAULT_LOOKAT);
        targetPosRef.current.copy(DEFAULT_POS);
        targetLookAtRef.current.copy(DEFAULT_LOOKAT);
        targetFovRef.current = DEFAULT_FOV;

        // 瞬間移動させる
        camera.position.copy(INTRO_START_POS);
        camera.lookAt(DEFAULT_LOOKAT);
        break;

      case 'closeUp':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;

          // キャラの顔の高さ（身長から0.2m程度下と仮定、またはデフォルト1.25m）
          const faceHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight - 0.2 : 1.25);

          // カメラ位置: ターゲットの正面に移動（少し離れた位置）
          // Z軸正方向がカメラ側と仮定
          targetPosRef.current.set(tx, faceHeight, tz + 1.5);
          targetLookAtRef.current.set(tx, faceHeight, tz); // 顔の高さを直接見る

          // ズームイン（FOVを狭くする）
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          // ターゲットなしならデフォルトへ
          targetPosRef.current.copy(DEFAULT_POS);
          targetLookAtRef.current.copy(DEFAULT_LOOKAT);
          targetFovRef.current = DEFAULT_FOV;
        }
        break;

      case 'default':
      default:
        targetPosRef.current.copy(DEFAULT_POS);
        targetLookAtRef.current.copy(DEFAULT_LOOKAT);
        targetFovRef.current = DEFAULT_FOV;
        break;
    }

    startTimeRef.current = null; // 次のフレームで開始時刻設定
    setAnimating(true);
  }, [cameraState, camera, controls]);

  useFrame(() => {
    if (!animating) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      return;
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const t = Math.min(elapsed / durationRef.current, 1);

    // Easing (SmoothStep)
    const smoothT = t * t * (3 - 2 * t);

    camera.position.lerpVectors(startPosRef.current, targetPosRef.current, smoothT);

    // LookAtの補間
    const currentLookAt = new THREE.Vector3().lerpVectors(startLookAtRef.current, targetLookAtRef.current, smoothT);
    camera.lookAt(currentLookAt);

    // FOVの補間（PerspectiveCameraの場合のみ）
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(startFovRef.current, targetFovRef.current, smoothT);
      camera.updateProjectionMatrix();
    }

    if (t >= 1) {
      setAnimating(false);

      // 最終位置合わせ
      camera.position.copy(targetPosRef.current);
      camera.lookAt(targetLookAtRef.current);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = targetFovRef.current;
        camera.updateProjectionMatrix();
      }

      // OrbitControls のターゲットを設定してから再有効化
      const orbitControls = getOrbitControls();
      if (orbitControls) {
        orbitControls.target.copy(targetLookAtRef.current);
        orbitControls.update();
        orbitControls.enabled = true;
      }
    }
  });

  return null;
};
