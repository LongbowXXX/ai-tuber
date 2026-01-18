import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { RootState } from '@react-three/fiber';
import { DEFAULT_AVATAR_CONFIG } from '../constants/avatar_config';

export const useAvatarLookAt = (
  vrm: VRM | null,
  isLoaded: boolean,
  currentAnimationName: string | null,
  config?: {
    yawLimitDeg: number;
    pitchLimitDeg: number;
    headWeight: number;
    neckWeight: number;
    disableLookAtAnimations?: string[];
  }
) => {
  const lookAtTargetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  // 初期化時にVRMのtargetに割り当てる
  useEffect(() => {
    if (isLoaded && vrm && vrm.lookAt) {
      vrm.lookAt.target = lookAtTargetRef.current;
    }
  }, [isLoaded, vrm]);

  const updateLookAt = useCallback(
    (state: RootState) => {
      if (!vrm || !lookAtTargetRef.current) return;

      const headNode = vrm.humanoid.getNormalizedBoneNode('head');
      const neckNode = vrm.humanoid.getNormalizedBoneNode('neck');
      if (!headNode) return;

      // Headボーンのワールド位置 -> ローカル位置
      const headWorldPos = new THREE.Vector3();
      headNode.getWorldPosition(headWorldPos);
      const localHeadPos = vrm.scene.worldToLocal(headWorldPos);

      // 特定のアニメーションの最中はLookAtを無効化し、正面を見るようにする
      const disabledAnimations = config?.disableLookAtAnimations ?? DEFAULT_AVATAR_CONFIG.lookAt.disabledAnimations;
      if (currentAnimationName && disabledAnimations.includes(currentAnimationName)) {
        // ローカル座標系で正面(Z+)にターゲットを置く
        const centerDir = new THREE.Vector3(0, 0, 1.0);
        const centerPos = new THREE.Vector3().addVectors(localHeadPos, centerDir);
        lookAtTargetRef.current.position.copy(centerPos);
        return;
      }

      const camera = state.camera;

      // カメラのワールド位置を取得
      const cameraPos = camera.position.clone();

      // VRMのシーンローカル座標系におけるカメラ位置
      const localCameraPos = vrm.scene.worldToLocal(cameraPos);

      const targetDir = new THREE.Vector3().subVectors(localCameraPos, localHeadPos);

      // Yaw (左右) 計算
      let yaw = Math.atan2(targetDir.x, targetDir.z);
      // Pitch (上下) 計算
      const xzLen = Math.sqrt(targetDir.x * targetDir.x + targetDir.z * targetDir.z);
      let pitch = Math.atan2(targetDir.y, xzLen);

      // 角度制限 (ラジアン)
      const yawLimit = (config?.yawLimitDeg ?? 50) * (Math.PI / 180);
      const pitchLimit = (config?.pitchLimitDeg ?? 30) * (Math.PI / 180);

      yaw = THREE.MathUtils.clamp(yaw, -yawLimit, yawLimit);
      pitch = THREE.MathUtils.clamp(pitch, -pitchLimit, pitchLimit);

      // --- Head & Neck Rotation Application ---
      // 回転をHeadとNeckに分配する比率 (例: Head 50%, Neck 50%)
      const headWt = config?.headWeight ?? 0.5;
      const neckWt = config?.neckWeight ?? 0.5;

      // 目線 (VRM LookAt) 用のターゲット計算
      // 制限した角度から位置を再計算
      const distance = targetDir.length();
      const clampedDir = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
      ).multiplyScalar(distance);

      // 最終的なターゲット位置（ローカル）
      const finalLocalPos = new THREE.Vector3().addVectors(localHeadPos, clampedDir);

      // lookAtTargetRefの位置を更新 (目の動き用)
      lookAtTargetRef.current.position.copy(finalLocalPos);

      // --- Head & Neck Rotation (Bone Manipulation) ---
      // アニメーション適用後のポーズに対して、カメラ方向への回転を上書き(または加算)する
      // ここではシンプルに、現在のポーズを無視して「カメラを見る」回転にするアプローチをとる
      // (アニメーションの首の動きは上書きされる)

      // PitchはX軸回転、YawはY軸回転 (VRM標準ボーンの軸定義に依存するが、概ねこれで合う)
      // Pitch: 上 (+Y) を見るとき、首は後ろに反る必要がある。
      // 右手系、親指が+X(右)。指が巻く方向が正。
      // +X回転 -> 上を向く(後ろに倒れる) ?
      // 下を向く -> 前に倒れる。
      // 試行錯誤が必要だが、通常 -Pitch で合うケースが多い (or +Pitch).
      // VRM: +Y is Up, +Z is Forward.
      // Rotation X: +X brings +Y towards +Z (Backwards? No).
      // +X brings +Y towards -Z (Forward? No).
      // Right Hand Rule on X (Red, Right): Y (Green, Up) rotates towards Z (Blue, Forward).
      // So +X rotates Up->Forward (Down look).
      // So +Pitch (Look Up) needs -X rotation.

      const twist = 0; // 首のひねりは一旦0

      // Head Rotation
      const headYaw = yaw * headWt;
      const headPitch = pitch * headWt;
      const headQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-headPitch, headYaw, twist, 'YXZ'));

      // Neck Rotation
      if (neckNode) {
        const neckYaw = yaw * neckWt;
        const neckPitch = pitch * neckWt;
        const neckQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-neckPitch, neckYaw, twist, 'YXZ'));
        // もしくは直接代入: neckNode.quaternion.copy(neckQuat);
        // 既存アニメーションがあると update で上書きされるが、hooksの実行タイミングは mixer update 後。
        // なので copy すれば上書きになる。
        // 完全にカメラを見るなら copy。自然な揺れを残すなら slerp だが、元がidleだとRestPoseに近い。
        // ここでは「しっかり見る」ために slerp(target, 0.8) くらいで適用してみる
        neckNode.quaternion.slerp(neckQuat, 0.8);
      }

      // Head Apply
      // HeadはNeckの子なので、Neckの回転分は親の回転として乗る。
      // なのでHead自体は自身の分だけ回せばよい。
      headNode.quaternion.slerp(headQuat, 0.8);
    },
    [vrm, currentAnimationName, config]
  );

  return { lookAtTargetRef, updateLookAt };
};
