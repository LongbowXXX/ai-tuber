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
  INTRO_CONTROL_POINT,
  CLOSEUP_FOV,
  FULLBODY_POS,
  FULLBODY_FOV,
  LOW_ANGLE_POS,
  LOW_ANGLE_LOOKAT,
  HIGH_ANGLE_POS,
  HIGH_ANGLE_LOOKAT,
  SIDE_RIGHT_POS,
  SIDE_LEFT_POS,
  FACE_HEIGHT_OFFSET,
  DEFAULT_FACE_HEIGHT,
  CENTER_HEIGHT_RATIO,
  SIDE_HEIGHT_RATIO,
  DEFAULT_CENTER_HEIGHT,
  SIDE_CENTER_HEIGHT_DEFAULT,
  CLOSEUP_OFFSET_Z,
  FULLBODY_OFFSET_Z,
  LOW_ANGLE_OFFSET_Z,
  HIGH_ANGLE_OFFSET_Z,
  SIDE_ANGLE_OFFSET_X,
  SIDE_ANGLE_OFFSET_Z,
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

  // Curve for Intro
  const introCurveRef = useRef<THREE.QuadraticBezierCurve3 | null>(null);

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

    // Helper functions for height calculation
    const calculateFaceHeight = (ty: number, h?: number) => {
      return ty + (h !== undefined ? h - FACE_HEIGHT_OFFSET : DEFAULT_FACE_HEIGHT);
    };

    const calculateCenterHeight = (ty: number, h: number | undefined, ratio: number, defaultVal: number) => {
      return ty + (h !== undefined ? h * ratio : defaultVal);
    };

    switch (cameraState.mode) {
      case 'intro':
        // Intro: 上空から定位置へ (Spiral Crane Shot)
        startPosRef.current.copy(INTRO_START_POS);
        startLookAtRef.current.copy(DEFAULT_LOOKAT);
        targetPosRef.current.copy(DEFAULT_POS);
        targetLookAtRef.current.copy(DEFAULT_LOOKAT);
        targetFovRef.current = DEFAULT_FOV;

        introCurveRef.current = new THREE.QuadraticBezierCurve3(INTRO_START_POS, INTRO_CONTROL_POINT, DEFAULT_POS);

        camera.position.copy(INTRO_START_POS);
        camera.lookAt(DEFAULT_LOOKAT);
        break;

      case 'closeUp':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const faceHeight = calculateFaceHeight(ty, cameraState.targetHeight);

          targetPosRef.current.set(tx, faceHeight, tz + CLOSEUP_OFFSET_Z);
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
          const centerHeight = calculateCenterHeight(
            ty,
            cameraState.targetHeight,
            CENTER_HEIGHT_RATIO,
            DEFAULT_CENTER_HEIGHT
          );

          targetPosRef.current.set(tx, centerHeight, tz + FULLBODY_OFFSET_Z);
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
          const faceHeight = calculateFaceHeight(ty, cameraState.targetHeight);

          targetPosRef.current.set(tx, 0.5, tz + LOW_ANGLE_OFFSET_Z);
          targetLookAtRef.current.set(tx, faceHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(LOW_ANGLE_POS);
          targetLookAtRef.current.copy(LOW_ANGLE_LOOKAT);
          // Review Feedback: Consistency in FOV for angle shots
          targetFovRef.current = CLOSEUP_FOV;
        }
        break;

      case 'highAngle':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const centerHeight = calculateCenterHeight(
            ty,
            cameraState.targetHeight,
            CENTER_HEIGHT_RATIO,
            DEFAULT_CENTER_HEIGHT
          );
          const faceHeight = calculateFaceHeight(ty, cameraState.targetHeight);

          targetPosRef.current.set(tx, faceHeight + 1.3, tz + HIGH_ANGLE_OFFSET_Z);
          targetLookAtRef.current.set(tx, centerHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          targetPosRef.current.copy(HIGH_ANGLE_POS);
          targetLookAtRef.current.copy(HIGH_ANGLE_LOOKAT);
          // Review Feedback: Consistency in FOV
          targetFovRef.current = CLOSEUP_FOV;
        }
        break;

      case 'sideRight':
      case 'sideLeft':
        if (cameraState.targetPosition) {
          const [tx, ty, tz] = cameraState.targetPosition;
          const centerHeight = calculateCenterHeight(
            ty,
            cameraState.targetHeight,
            SIDE_HEIGHT_RATIO,
            SIDE_CENTER_HEIGHT_DEFAULT
          );
          const isRight = cameraState.mode === 'sideRight';
          const directionMultiplier = isRight ? 1 : -1;

          targetPosRef.current.set(
            tx + SIDE_ANGLE_OFFSET_X * directionMultiplier,
            centerHeight,
            tz + SIDE_ANGLE_OFFSET_Z
          );
          targetLookAtRef.current.set(tx, centerHeight, tz);
          targetFovRef.current = CLOSEUP_FOV;
        } else {
          const pos = cameraState.mode === 'sideRight' ? SIDE_RIGHT_POS : SIDE_LEFT_POS;
          targetPosRef.current.copy(pos);
          targetLookAtRef.current.copy(DEFAULT_LOOKAT);
          // Review Feedback: Consistency in FOV
          targetFovRef.current = CLOSEUP_FOV;
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
    // Introの場合は、少しゆっくり見せるために easeOutQuart (1 - (1-x)^4) なども良いが、まずは統一感を重視
    const smoothT = t * t * t * (t * (t * 6 - 15) + 10);

    if (cameraState?.mode === 'intro' && introCurveRef.current) {
      // Curveに沿って移動
      const point = introCurveRef.current.getPoint(smoothT);
      camera.position.copy(point);
    } else {
      // 通常の直線移動
      camera.position.lerpVectors(startPosRef.current, targetPosRef.current, smoothT);
    }

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
