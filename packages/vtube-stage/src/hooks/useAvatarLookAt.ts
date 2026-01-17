import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { RootState } from '@react-three/fiber';

export const useAvatarLookAt = (vrm: VRM | null, isLoaded: boolean) => {
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
      if (!headNode) return;

      const camera = state.camera;

      // カメラのワールド位置を取得
      const cameraPos = camera.position.clone();

      // VRMのシーンローカル座標系におけるカメラ位置
      const localCameraPos = vrm.scene.worldToLocal(cameraPos);

      // Headボーンのワールド位置 -> ローカル位置
      const headWorldPos = new THREE.Vector3();
      headNode.getWorldPosition(headWorldPos);
      const localHeadPos = vrm.scene.worldToLocal(headWorldPos);

      const targetDir = new THREE.Vector3().subVectors(localCameraPos, localHeadPos);

      // Yaw (左右) 計算
      let yaw = Math.atan2(targetDir.x, targetDir.z);
      // Pitch (上下) 計算
      const xzLen = Math.sqrt(targetDir.x * targetDir.x + targetDir.z * targetDir.z);
      let pitch = Math.atan2(targetDir.y, xzLen);

      // 角度制限 (ラジアン)
      const YAW_LIMIT = 50 * (Math.PI / 180); // 左右 50度
      const PITCH_LIMIT = 30 * (Math.PI / 180); // 上下 30度

      yaw = THREE.MathUtils.clamp(yaw, -YAW_LIMIT, YAW_LIMIT);
      pitch = THREE.MathUtils.clamp(pitch, -PITCH_LIMIT, PITCH_LIMIT);

      // 制限した角度から位置を再計算
      const distance = targetDir.length();

      const clampedDir = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
      ).multiplyScalar(distance);

      // 最終的なターゲット位置（ローカル）
      const finalLocalPos = new THREE.Vector3().addVectors(localHeadPos, clampedDir);

      // lookAtTargetRefの位置を更新
      lookAtTargetRef.current.position.copy(finalLocalPos);
    },
    [vrm]
  );

  return { lookAtTargetRef, updateLookAt };
};
