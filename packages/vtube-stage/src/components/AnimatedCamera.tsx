import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CameraShake } from '@react-three/drei';
import {
  CameraState,
  DEFAULT_DURATION,
  DEFAULT_FOV,
  DEFAULT_LOOKAT,
  DEFAULT_POS,
  INTRO_START_POS,
  CLOSEUP_FOV,
  FULLBODY_POS,
  FULLBODY_FOV,
  LOW_ANGLE_POS,
  LOW_ANGLE_LOOKAT,
  HIGH_ANGLE_POS,
  HIGH_ANGLE_LOOKAT,
  SIDE_RIGHT_POS,
  SIDE_LEFT_POS,
} from './CameraConfig';

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

  // Shake Configuration State
  const [shakeConfig, setShakeConfig] = useState({
    maxYaw: 0.05,
    maxPitch: 0.05,
    maxRoll: 0.05,
    yawFrequency: 0.5,
    pitchFrequency: 0.5,
    rollFrequency: 0.5,
    intensity: 0, // Default to 0, enabled by mode
  });

  // OrbitControls への参照を取得
  const getOrbitControls = useCallback((): OrbitControlsImpl | null => {
    if (controls && controls instanceof OrbitControlsImpl) {
      return controls;
    }
    return null;
  }, [controls]);

  // モードごとのシェイク設定を決定
  const updateShakeConfig = useCallback((mode: string) => {
    switch (mode) {
      case 'intro':
        // Intro時は揺らさない（または非常にゆっくり）
        setShakeConfig(prev => ({ ...prev, intensity: 0 }));
        break;
      case 'closeUp':
        // CloseUp: 緊張感のある手持ち感（小刻み）
        setShakeConfig({
          maxYaw: 0.02,
          maxPitch: 0.02,
          maxRoll: 0.02,
          yawFrequency: 0.8,
          pitchFrequency: 0.8,
          rollFrequency: 0.8,
          intensity: 1.0,
        });
        break;
      case 'lowAngle':
      case 'highAngle':
      case 'sideRight':
      case 'sideLeft':
        // アングルショット: ゆったりとした浮遊感
        setShakeConfig({
          maxYaw: 0.05,
          maxPitch: 0.05,
          maxRoll: 0.05,
          yawFrequency: 0.3,
          pitchFrequency: 0.3,
          rollFrequency: 0.3,
          intensity: 0.8,
        });
        break;
      case 'default':
      case 'fullBody':
      default:
        // Default: 呼吸のような極めて微細な揺れ
        setShakeConfig({
          maxYaw: 0.01,
          maxPitch: 0.01,
          maxRoll: 0.01,
          yawFrequency: 0.2,
          pitchFrequency: 0.2,
          rollFrequency: 0.2,
          intensity: 0.5,
        });
        break;
    }
  }, []);

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

    // シェイク設定の更新
    updateShakeConfig(cameraState.mode);

    switch (cameraState.mode) {
      case 'intro':
        // Intro: 上空から定位置へ (Crane shot style)
        // 始点を Config から取得
        startPosRef.current.copy(INTRO_START_POS);
        startLookAtRef.current.copy(DEFAULT_LOOKAT); // 見下ろす
        targetPosRef.current.copy(DEFAULT_POS);
        targetLookAtRef.current.copy(DEFAULT_LOOKAT);
        targetFovRef.current = DEFAULT_FOV;

        // 瞬間移動させる (アニメーションスタート地点へ)
        camera.position.copy(INTRO_START_POS);
        camera.lookAt(DEFAULT_LOOKAT);
        break;

      case 'closeUp':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          // キャラの顔の高さ
          const faceHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight - 0.2 : 1.25);

          targetPosRef.current.set(tx, faceHeight, tz + 1.5);
          targetLookAtRef.current.set(tx, faceHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(DEFAULT_POS);
          targetLookAtRef.current.copy(DEFAULT_LOOKAT);
          targetFovRef.current = DEFAULT_FOV;
        }
        break;

      case 'fullBody':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const centerHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight * 0.5 : 0.8);
          targetPosRef.current.set(tx, centerHeight, tz + 3.5);
          targetLookAtRef.current.set(tx, centerHeight, tz);
          targetFovRef.current = FULLBODY_FOV;
        } else {
          targetPosRef.current.copy(FULLBODY_POS);
          targetLookAtRef.current.copy(DEFAULT_LOOKAT);
          targetFovRef.current = FULLBODY_FOV;
        }
        break;

      case 'lowAngle':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const faceHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight - 0.2 : 1.25);
          targetPosRef.current.set(tx, 0.5, tz + 2.0);
          targetLookAtRef.current.set(tx, faceHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(LOW_ANGLE_POS);
          targetLookAtRef.current.copy(LOW_ANGLE_LOOKAT);
          targetFovRef.current = DEFAULT_FOV;
        }
        break;

      case 'highAngle':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const centerHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight * 0.5 : 0.8);
          const faceHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight - 0.2 : 1.25);
          targetPosRef.current.set(tx, faceHeight + 0.5, tz + 1.5);
          targetLookAtRef.current.set(tx, centerHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(HIGH_ANGLE_POS);
          targetLookAtRef.current.copy(HIGH_ANGLE_LOOKAT);
          targetFovRef.current = DEFAULT_FOV;
        }
        break;

      case 'sideRight':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const centerHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight * 0.6 : 1.0);
          targetPosRef.current.set(tx + 1.2, centerHeight, tz + 2.0);
          targetLookAtRef.current.set(tx, centerHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(SIDE_RIGHT_POS);
          targetLookAtRef.current.copy(DEFAULT_LOOKAT);
          targetFovRef.current = DEFAULT_FOV;
        }
        break;

      case 'sideLeft':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const centerHeight = ty + (cameraState.targetHeight ? cameraState.targetHeight * 0.6 : 1.0);
          targetPosRef.current.set(tx - 1.2, centerHeight, tz + 2.0);
          targetLookAtRef.current.set(tx, centerHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(SIDE_LEFT_POS);
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
  }, [cameraState, camera, getOrbitControls, updateShakeConfig]);

  useFrame(() => {
    if (!animating) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      return;
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const t = Math.min(elapsed / durationRef.current, 1);

    // Improved Easing: SmootherStep (Ken Perlin's version)
    // t * t * t * (t * (t * 6 - 15) + 10)
    const smoothT = t * t * t * (t * (t * 6 - 15) + 10);

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

  return (
    <CameraShake
      maxYaw={shakeConfig.maxYaw}
      maxPitch={shakeConfig.maxPitch}
      maxRoll={shakeConfig.maxRoll}
      yawFrequency={shakeConfig.yawFrequency}
      pitchFrequency={shakeConfig.pitchFrequency}
      rollFrequency={shakeConfig.rollFrequency}
      intensity={shakeConfig.intensity}
    />
  );
};
