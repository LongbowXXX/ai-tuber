// src/components/SceneContent.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  VRM,
  VRMExpressionPresetName,
  VRMHumanBoneName,
} from "@pixiv/three-vrm";
import {
  createVRMAnimationClip,
  VRMAnimation,
  VRMAnimationLoaderPlugin,
} from "@pixiv/three-vrm-animation";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { VRMAvatar } from "./VRMAvatar";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// --- 定数 ---
const ANIMATION_FADE_DURATION = 0.3; // アニメーションのフェード時間

interface SceneContentProps {
  vrm: VRM | null;
  expressionWeights: Record<string, number>;
  headYaw: number;
  onLoad: (vrm: VRM) => void;
  currentAnimationName: string;
}

export const SceneContent: React.FC<SceneContentProps> = ({
  vrm,
  expressionWeights,
  headYaw,
  onLoad,
  currentAnimationName,
}) => {
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const vrmAnimations = useRef<Record<string, VRMAnimation>>({});
  const [loadedAnimationNames, setLoadedAnimationNames] = useState(
    new Set<string>()
  );
  const [isInitialAnimationReady, setIsInitialAnimationReady] = useState(false); // State for initial animation readiness
  const initialAnimSetupDone = useRef(false); // Ref to track if initial setup is done

  // --- VRMAアニメーションローダー ---
  const vrmaLoader = useMemo(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    return loader;
  }, []);

  // --- アニメーション読み込み関数 ---
  const loadAnimation = useCallback(
    async (name: string, url: string) => {
      try {
        const gltf = await vrmaLoader.loadAsync(url);
        const animation = gltf.userData.vrmAnimations?.[0] as
          | VRMAnimation
          | undefined;
        if (animation) {
          console.log(`Loaded ${name} VRMA animation:`, animation);
          vrmAnimations.current[name] = animation;
          setLoadedAnimationNames((prev) => new Set(prev).add(name));
          return animation; // 読み込んだアニメーションを返す
        } else {
          console.warn(`Animation not found in ${url}`);
          return null;
        }
      } catch (error) {
        console.error(`Error loading ${name} animation:`, error);
        return null;
      }
    },
    [vrmaLoader] // vrmaLoaderが変わらない限り関数は再生成されない
  );

  // --- アニメーションの読み込み ---
  useEffect(() => {
    // 初回レンダリング時にアニメーションを読み込む
    loadAnimation("idle", "/idle.vrma");
    loadAnimation("wave", "/wave.vrma");
    // loadAnimationはuseCallbackでメモ化されているため、依存配列に含めても無限ループしない
  }, [loadAnimation]);

  // --- アニメーションクリップ作成関数 ---
  const createAnimationClipFromVRMA = useCallback(
    (animationName: string): THREE.AnimationClip | null => {
      if (vrm && vrmAnimations.current[animationName]) {
        return createVRMAnimationClip(
          vrmAnimations.current[animationName],
          vrm
        );
      }
      return null;
    },
    [vrm] // vrmが変わった時だけ再生成
  );

  // --- AnimationMixerのセットアップとアニメーション切り替え ---
  useEffect(() => {
    // VRMがない、または現在指定されているアニメーションがまだ読み込まれていない場合は処理を中断
    if (!vrm || !loadedAnimationNames.has(currentAnimationName)) {
      // VRMがない場合はMixerを破棄 (既存ロジック)
      if (!vrm && mixer.current) {
        console.log("Cleaning up AnimationMixer due to VRM unload");
        mixer.current.stopAllAction();
        mixer.current = null;
        currentAction.current = null;
      }
      // アニメーション未ロードの場合も早期リターン
      if (vrm && !loadedAnimationNames.has(currentAnimationName)) {
        console.log(`Animation ${currentAnimationName} not loaded yet.`);
        // 必要であれば現在のアクションを停止するロジックを追加することも可能
        // if (currentAction.current) {
        //     currentAction.current.stop();
        //     currentAction.current = null;
        // }
      }
      return; // 早期リターン
    }

    // Mixerが存在しない場合は作成
    if (!mixer.current) {
      mixer.current = new THREE.AnimationMixer(vrm.scene);
      console.log("AnimationMixer created");
    }

    // 再生するアニメーションクリップを取得
    const clip = createAnimationClipFromVRMA(currentAnimationName);

    if (clip) {
      const newAction = mixer.current.clipAction(clip);

      // 現在のアクションと新しいアクションが異なる場合のみ切り替え処理
      // クリップオブジェクトを直接比較する方が確実
      if (currentAction.current?.getClip() !== clip) {
        // 古いアクションをフェードアウト
        if (currentAction.current) {
          currentAction.current.fadeOut(ANIMATION_FADE_DURATION);
        }

        // 新しいアクションをフェードインして再生
        newAction
          .reset()
          .setEffectiveTimeScale(1)
          .setEffectiveWeight(1)
          .fadeIn(ANIMATION_FADE_DURATION)
          .play();

        currentAction.current = newAction; // 現在のアクションを更新
        console.log(`Switched animation to: ${currentAnimationName}`);

        // Check if it's the initial idle animation and setup is not done
        if (!initialAnimSetupDone.current && currentAnimationName === "idle") {
          setIsInitialAnimationReady(true);
          initialAnimSetupDone.current = true;
          console.log("Initial animation ('idle') is ready and playing.");
        }
      } else if (!currentAction.current) {
        // 初回再生または停止からの再生
        newAction.reset().play();
        currentAction.current = newAction;
        console.log(`Initial animation playing: ${currentAnimationName}`);

        // Check if it's the initial idle animation and setup is not done
        if (!initialAnimSetupDone.current && currentAnimationName === "idle") {
          setIsInitialAnimationReady(true);
          initialAnimSetupDone.current = true;
          console.log("Initial animation ('idle') is ready and playing.");
        }
      }
    } else {
      // クリップが作成できなかった場合 (ロード済みチェックがあるため通常は発生しないはず)
      console.warn(
        `Failed to create clip for loaded animation: ${currentAnimationName}`
      );
      if (currentAction.current) {
        currentAction.current.stop();
        currentAction.current = null;
        console.log(`Stopping current action due to clip creation failure.`);
      }
    }

    // クリーンアップ関数: コンポーネントアンマウント時またはVRM変更時にMixerを停止
    return () => {
      if (mixer.current && vrm) {
        // vrmが変わる直前のクリーンアップ
        console.log("Cleaning up AnimationMixer on effect re-run or unmount");
      }
    };
    // vrm または currentAnimationName が変更されたら再実行
  }, [
    vrm,
    currentAnimationName,
    createAnimationClipFromVRMA,
    loadedAnimationNames,
  ]);

  // --- 表情更新関数 ---
  const updateExpressions = useCallback(() => {
    if (!vrm?.expressionManager) return;
    Object.entries(expressionWeights).forEach(([name, weight]) => {
      try {
        vrm.expressionManager!.setValue(
          name as VRMExpressionPresetName,
          weight
        );
      } catch (error) {
        console.warn(`Failed to set expression ${name}`, error);
      }
    });
  }, [vrm, expressionWeights]); // vrmとexpressionWeightsが変わった時だけ再生成

  // --- 頭部回転更新関数 ---
  const updateHeadRotation = useCallback(() => {
    if (!vrm?.humanoid) return;
    const headBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
    if (headBone) {
      headBone.rotation.y = THREE.MathUtils.degToRad(headYaw);
    }
  }, [vrm, headYaw]); // vrmとheadYawが変わった時だけ再生成

  // --- フレームごとの更新 ---
  useFrame((_state, delta) => {
    updateExpressions();
    updateHeadRotation();
    mixer.current?.update(delta); // AnimationMixerの更新
  });

  // --- シーン要素のレンダリング ---
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

      {/* VRMアバターコンポーネント - Pass isInitialAnimationReady */}
      <VRMAvatar
        vrmUrl="/avatar.vrm"
        onLoad={onLoad}
        isReadyToAnimate={isInitialAnimationReady} // Pass the state down
      />

      {/* カメラ操作 */}
      <OrbitControls target={[0, 1, 0]} />
    </>
  );
};
