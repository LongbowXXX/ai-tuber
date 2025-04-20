// src/components/SceneContent.tsx
import React from "react";
import { useFrame } from "@react-three/fiber";
import {
  VRM,
  VRMExpressionPresetName,
  VRMHumanBoneName,
} from "@pixiv/three-vrm";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { VRMAvatar } from "./VRMAvatar"; // VRMAvatar をインポート

interface SceneContentProps {
  vrm: VRM | null; // 親から渡されるVRMインスタンス
  expressionWeights: Record<string, number>; // 親から渡される表情ウェイト
  headYaw: number; // 親から渡される頭の角度
  onLoad: (vrm: VRM) => void; // VRMAvatarに渡すためのコールバック
}

export const SceneContent: React.FC<SceneContentProps> = ({
  vrm,
  expressionWeights,
  headYaw,
  onLoad, // 親から受け取る
}) => {
  // フレームごとのVRM更新ロジック (このコンポーネントはCanvas内にあるのでOK)
  useFrame(() => {
    if (vrm?.expressionManager) {
      // Stateに基づいて表情を更新
      Object.entries(expressionWeights).forEach(([name, weight]) => {
        // nameがVRMExpressionPresetNameに含まれるかチェックする方がより安全
        try {
          vrm.expressionManager!.setValue(
            name as VRMExpressionPresetName,
            weight
          );
        } catch (error) {
          console.warn(`Failed to set expression ${name}`, error);
        }
      });
    }

    if (vrm?.humanoid) {
      // Stateに基づいて頭の回転を更新
      const headBone = vrm.humanoid.getNormalizedBoneNode(
        VRMHumanBoneName.Head
      );
      if (headBone) {
        // Y軸周りの回転を設定
        headBone.rotation.y = THREE.MathUtils.degToRad(headYaw);
      }
    }
  });

  // シーンの要素をレンダリング
  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.8} />
      {/* 平行光源 */}
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* 床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="grey" />
      </mesh>

      {/* VRMアバターコンポーネント */}
      {/* onLoadコールバックをVRMAvatarに渡す */}
      <VRMAvatar vrmUrl="/avatar.vrm" onLoad={onLoad} />

      {/* カメラ操作 */}
      <OrbitControls target={[0, 1, 0]} />
    </>
  );
};
