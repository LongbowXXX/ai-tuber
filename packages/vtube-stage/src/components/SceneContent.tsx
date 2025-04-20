// src/components/SceneContent.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import {
  VRM,
  VRMExpressionPresetName,
  VRMHumanBoneName,
} from "@pixiv/three-vrm";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { VRMAvatar } from "./VRMAvatar"; // VRMAvatar をインポート
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

interface SceneContentProps {
  vrm: VRM | null; // 親から渡されるVRMインスタンス
  expressionWeights: Record<string, number>; // 親から渡される表情ウェイト
  headYaw: number; // 親から渡される頭の角度
  onLoad: (vrm: VRM) => void; // VRMAvatarに渡すためのコールバック
  currentAnimationName: string; // 現在のアニメーション名
}

export const SceneContent: React.FC<SceneContentProps> = ({
  vrm,
  expressionWeights,
  headYaw,
  onLoad, // 親から受け取る
  currentAnimationName,
}) => {
  const mixer = useRef<THREE.AnimationMixer | null>(null); // AnimationMixerのref
  const currentAction = useRef<THREE.AnimationAction | null>(null); // 現在再生中のアクション

  // --- FBXアニメーションの読み込み ---
  // useLoaderを使って複数のFBXファイルを読み込む
  // ここでは 'idle.fbx' と 'wave.fbx' を読み込む例
  const idleAnim = useLoader(FBXLoader, "/idle.fbx");
  const waveAnim = useLoader(FBXLoader, "/wave.fbx");

  // 読み込んだアニメーションクリップを名前付きで保持 (useMemoで最適化)
  const animations = useMemo(() => {
    const clips: Record<string, THREE.AnimationClip> = {};
    // FBXLoaderはAnimationClipの配列を返すので、通常は最初のクリップを使用
    if (idleAnim?.animations[0]) {
      clips["idle"] = idleAnim.animations[0];
    }
    if (waveAnim?.animations[0]) {
      // 名前が重複しないように調整（必要に応じて）
      // waveAnim.animations[0].name = 'wave';
      clips["wave"] = waveAnim.animations[0];
    }
    console.log("Loaded animation clips:", Object.keys(clips));
    return clips;
  }, [idleAnim, waveAnim]); // ローダーの結果が変わった時だけ再計算

  // --- AnimationMixerのセットアップ ---
  // VRMモデルがロードされたらMixerを作成
  useEffect(() => {
    if (vrm) {
      mixer.current = new THREE.AnimationMixer(vrm.scene); // VRMのシーンをミキサーに渡す
      console.log("AnimationMixer created");

      // 初期アニメーションを再生
      if (animations[currentAnimationName]) {
        const clip = animations[currentAnimationName];
        const action = mixer.current.clipAction(clip);
        action.reset().play();
        currentAction.current = action;
        console.log(`Initial animation playing: ${currentAnimationName}`);
      }

      // クリーンアップ関数
      return () => {
        console.log("Cleaning up AnimationMixer");
        mixer.current?.stopAllAction(); // 全てのアクションを停止
        mixer.current = null;
        currentAction.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vrm, animations]); // vrmまたはanimationsが変更されたら再実行

  // --- アニメーションの切り替え ---
  useEffect(() => {
    if (mixer.current && animations[currentAnimationName]) {
      const clip = animations[currentAnimationName];
      const newAction = mixer.current.clipAction(clip);

      // 現在のアクションがあればフェードアウト、なければ即時停止
      if (currentAction.current && currentAction.current !== newAction) {
        currentAction.current.fadeOut(0.3); // 0.3秒でフェードアウト
      } else if (currentAction.current !== newAction) {
        currentAction.current?.stop(); // 古いアクションを即時停止
      }

      // 新しいアクションをフェードインして再生
      newAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play(); // 0.3秒でフェードイン

      currentAction.current = newAction; // 現在のアクションを更新
      console.log(`Switched animation to: ${currentAnimationName}`);
    }
  }, [currentAnimationName, animations, vrm]); // アニメーション名、クリップ、VRMが変わったら実行

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
