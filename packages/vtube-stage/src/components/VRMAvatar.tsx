// src/components/VRMAvatar.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { SpeechBubble } from './SpeechBubble'; // Import the SpeechBubble component
import { playVoice } from '../services/tts_service';
import { useVrmModel } from '../hooks/useVrmModel';
import { SpeakMessage } from '../types/avatar_types';
import { useFacialExpression } from '../hooks/useFacialExpression';

// --- Constants ---
const ANIMATION_FADE_DURATION = 0.3;

export interface VRMAvatarProps {
  id: string;
  vrmUrl: string;
  animationUrls: Record<string, string>;
  currentEmotion: string;
  currentAnimationName: string | null;
  speechText: SpeakMessage | null;
  position?: [number, number, number];
  onLoad?: (vrm: VRM) => void;
  onTTSComplete?: (speakId: string) => void;
  onAnimationEnd?: (animationName: string) => void;
  height?: number;
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({
  id,
  vrmUrl,
  animationUrls,
  currentEmotion: current_emotion,
  currentAnimationName,
  speechText,
  position = [0, 0, 0],
  onLoad,
  onTTSComplete,
  onAnimationEnd,
  height,
}) => {
  const { gltf, vrmRef, mixer, isLoaded, loadedAnimationNames, createAnimationClipFromVRMA } = useVrmModel(
    vrmUrl,
    animationUrls,
    onLoad
  );
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const [bubbleText, setBubbleText] = useState<SpeakMessage | null>(null);
  const animationTimeoutRef = useRef<number | null>(null); // 3秒タイマー用ref: number型に修正

  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);

  // --- Animation Switching ---
  useEffect(() => {
    const vrm = vrmRef.current;
    const currentMixer = mixer.current;
    // Ensure VRM, Mixer exist and the target animation is loaded
    if (!vrm || !currentMixer || !currentAnimationName || !loadedAnimationNames.has(currentAnimationName)) {
      return;
    }

    // アニメーション強制終了用タイマーをクリア
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const clip = createAnimationClipFromVRMA(currentAnimationName);

    if (clip) {
      const newAction = currentMixer.clipAction(clip);

      if (currentAction.current?.getClip() !== clip) {
        if (currentAction.current) {
          currentAction.current.fadeOut(ANIMATION_FADE_DURATION);
        }

        const newAnimationName = currentAnimationName;
        // If the animation is not idle, set it to return to idle after finishing
        if (currentAnimationName !== 'idle') {
          newAction.clampWhenFinished = true;
          newAction.setLoop(THREE.LoopOnce, 1);
          const onFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
            console.log(`Avatar ${vrmUrl}: onFinished ${currentAnimationName}`);
            if (event?.action === newAction) {
              currentMixer.removeEventListener('finished', onFinished); // Remove listener
              if (currentAction.current) {
                currentAction.current.fadeOut(ANIMATION_FADE_DURATION);
              }
              const idleClip = createAnimationClipFromVRMA('idle');
              if (idleClip) {
                const idleAction = currentMixer.clipAction(idleClip);
                idleAction
                  .reset()
                  .setEffectiveTimeScale(1)
                  .setEffectiveWeight(1)
                  .fadeIn(ANIMATION_FADE_DURATION)
                  .play();
                currentAction.current = idleAction;
                console.log(`Avatar ${vrmUrl}: onFinished changed to idle`);
                if (onAnimationEnd) {
                  onAnimationEnd(newAnimationName); // アニメーション終了を通知
                }
              }
              // タイマーもクリア
              if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
                animationTimeoutRef.current = null;
              }
            }
          };
          newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(ANIMATION_FADE_DURATION).play();
          currentAction.current = newAction;
          currentMixer.addEventListener('finished', onFinished);

          // 3秒後にidleへ強制遷移
          animationTimeoutRef.current = window.setTimeout(() => {
            if (currentAction.current === newAction && currentAnimationName !== 'idle') {
              if (currentAction.current) {
                currentAction.current.fadeOut(ANIMATION_FADE_DURATION);
              }
              const idleClip = createAnimationClipFromVRMA('idle');
              if (idleClip) {
                const idleAction = currentMixer.clipAction(idleClip);
                idleAction
                  .reset()
                  .setEffectiveTimeScale(1)
                  .setEffectiveWeight(1)
                  .fadeIn(ANIMATION_FADE_DURATION)
                  .play();
                currentAction.current = idleAction;
                console.log(`Avatar ${vrmUrl}: forcibly changed to idle after 3s`);
                if (onAnimationEnd) {
                  onAnimationEnd(newAnimationName); // アニメーション終了を通知
                }
              }
              // イベントリスナーも外す
              currentMixer.removeEventListener('finished', onFinished);
            }
            animationTimeoutRef.current = null;
          }, 3000);
        } else {
          newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(ANIMATION_FADE_DURATION).play();
          currentAction.current = newAction;
        }

        console.log(`Avatar ${vrmUrl}: Switched animation to ${currentAnimationName}`);
      } else if (!currentAction.current) {
        // Initial play or restart after stop
        newAction.reset().play();
        currentAction.current = newAction;
        console.log(`Avatar ${vrmUrl}: Started animation ${currentAnimationName}`);
      }
    } else {
      console.warn(`Avatar ${vrmUrl}: Failed to create clip for ${currentAnimationName}`);
      if (currentAction.current) {
        currentAction.current.stop();
        currentAction.current = null;
      }
      // タイマーもクリア
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnimationName, loadedAnimationNames, id, onAnimationEnd, createAnimationClipFromVRMA]);

  const { updateExpressions } = useFacialExpression(isLoaded ? vrmRef.current : null, current_emotion, isTtsSpeaking);

  // --- LookAt Target Setup ---
  const lookAtTargetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  useEffect(() => {
    if (isLoaded && vrmRef.current) {
      const vrm = vrmRef.current;
      if (vrm.lookAt) {
        vrm.lookAt.target = lookAtTargetRef.current;
      }
      console.log('Set vrm.lookAt.target');
    }
  }, [isLoaded, vrmRef]);

  // --- Frame Update ---
  useFrame((state, delta) => {
    const vrm = vrmRef.current;
    if (vrm && lookAtTargetRef.current) {
      updateExpressions();
      mixer.current?.update(delta); // Update animation mixer

      // --- LookAt Logic with Limits ---
      const camera = state.camera;
      const headNode = vrm.humanoid.getNormalizedBoneNode('head');

      if (headNode) {
        // カメラのワールド位置を取得
        const cameraPos = camera.position.clone();

        // アバターのルート（VRMのシーン）の逆行列を使って、カメラ位置をローカル座標系に変換
        // これにより、アバターが回転していても正しく相対角度を計算できる
        const localCameraPos = vrm.scene.worldToLocal(cameraPos);

        // 球面座標系に変換して角度制限をかける
        // VRMの座標系（VRM0.0はZ+向きが正面となるようロード時に回転されている前提だが、要調整）
        // three-vrmでロードし RotateVRM0 している場合、Z+が正面

        // より正確には、Headボーンのワールド位置をルートローカルに変換して差分をとるのが良い
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

        // 制限した角度から位置を再計算 (距離は元のままでよい、あるいは一定距離前方に置く)
        // ここではターゲット位置を実際のカメラ距離と同じにして視差ボケ等を自然にする
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
      }

      vrm.update(delta); // Update VRM internal state (expressions, lookAt, physics)
    }
  });

  // TTS再生関数（onPlayコールバック対応）
  const playTTS = useCallback(
    async (text: string, onPlay?: () => void) => {
      console.log('[TTS] playTTS called with text:', text);
      await playVoice(id, text, onPlay); // onPlayを渡す
    },
    [id]
  );

  // speechTextが変化したらTTS再生→終了後に吹き出しを閉じる
  useEffect(() => {
    if (speechText && speechText.text !== '') {
      setBubbleText(speechText);
      // setIsLipSync(true); // ここでは開始しない
      playTTS(speechText.text, () => setIsTtsSpeaking(true)).then(() => {
        setBubbleText(null);
        setIsTtsSpeaking(false); // 再生終了でLipSync終了
        if (onTTSComplete && speechText.id) {
          onTTSComplete(speechText.id);
        }
      });
    }
    // クリーンアップ
    return () => {
      setIsTtsSpeaking(false);
    };
  }, [speechText, playTTS, onTTSComplete, id]);

  // Render only when VRM is loaded, applying the position
  return isLoaded && vrmRef.current ? (
    <primitive object={gltf.scene} position={position} dispose={null}>
      {/* LookAt Target Object (Scene Graphに追加しておくことでworldMatrixが更新される) */}
      <primitive object={lookAtTargetRef.current} />

      {/* Add SpeechBubble as a child, positioned relative to the avatar */}
      {bubbleText && <SpeechBubble message={bubbleText} position={[0, height || 1.8, 0]} />}
    </primitive>
  ) : null;
};
