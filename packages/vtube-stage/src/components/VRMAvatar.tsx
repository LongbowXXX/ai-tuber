// src/components/VRMAvatar.tsx
import React, { useEffect, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface VRMAvatarProps {
  vrmUrl: string;
  onLoad?: (vrm: VRM) => void; // VRM型を明示
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({ vrmUrl, onLoad }) => {
  const vrmRef = useRef<VRM | null>(null); // VRMインスタンスを保持するref

  const gltf = useLoader(GLTFLoader, vrmUrl, (loader) => {
    // VRMLoaderPluginを登録
    loader.register((parser) => {
      // parserにVRM拡張の情報を伝える
      return new VRMLoaderPlugin(parser);
    });
  });

  // VRMのセットアップ（ロード完了時に一度だけ実行）
  useEffect(() => {
    if (gltf.userData.vrm && !vrmRef.current) {
      const vrm: VRM = gltf.userData.vrm;

      // 以前のバージョン（0.x）のVRMをY軸方向に向けるためのユーティリティ
      VRMUtils.rotateVRM0(vrm);

      // 物理演算(SpringBone)を有効にする場合
      // VRMUtils.addVRMSpringBones(vrm);

      // シーン内の全てのメッシュで影を落とす/受け取る設定
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      console.log("VRM loaded:", vrm);
      vrmRef.current = vrm; // refにVRMインスタンスを保存
      if (onLoad) {
        onLoad(vrm); // 親コンポーネントにVRMインスタンスを渡す
      }
    }
    // コンポーネントアンマウント時にVRMリソースを解放
    return () => {
      if (vrmRef.current) {
        VRMUtils.deepDispose(vrmRef.current.scene);
        vrmRef.current = null;
      }
      // Loaderによって読み込まれたGLTFリソースの解放も検討（gltf.sceneなど）
    };
  }, [gltf, onLoad]);

  // アニメーションループでVRMを更新
  useFrame((_state, delta) => {
    if (vrmRef.current) {
      vrmRef.current.update(delta); // VRMの内部状態（表情、視線、物理など）を更新
    }
  });

  // シーンにVRMモデルを追加
  return vrmRef.current ? (
    <primitive object={gltf.scene} dispose={null} />
  ) : null;
};
