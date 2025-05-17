// src/components/VRMAvatar.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { VRM, VRMExpressionPresetName, VRMHumanBoneName } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { SpeechBubble } from './SpeechBubble'; // Import the SpeechBubble component
import { SpeakMessage } from '../types/command';
import { playVoice } from '../services/tts_service';
import { usePseudoLipSync } from './usePseudoLipSync';
import { useVrmModel } from '../hooks/useVrmModel';

// --- Constants ---
const ANIMATION_FADE_DURATION = 0.3;

export interface VRMAvatarProps {
  id: string;
  vrmUrl: string;
  // Animation URLs (example: { idle: '/idle.vrma', wave: '/wave.vrma' })
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string | null; // Allow currentAnimationName to be string or null
  speechText: SpeakMessage | null; // SpeakMessage型で受け取る
  position?: [number, number, number]; // Add position prop
  onLoad?: (vrm: VRM) => void; // Keep onLoad for potential external use, but internal logic won't depend on it passing upwards
  onTTSComplete?: (avatarId: string, speakId: string) => void; // TTS完了時コールバックを追加
  onAnimationEnd?: (avatarId: string, animationName: string) => void; // アニメーションが1ループ終了してidleに戻った際のコールバック
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({
  id,
  vrmUrl,
  animationUrls,
  expressionWeights,
  headYaw,
  currentAnimationName,
  speechText, // SpeakMessage型 or null
  position = [0, 0, 0], // Default position if not provided
  onLoad, // Keep prop signature
  onTTSComplete, // 追加
  onAnimationEnd, // 追加
}) => {
  const { gltf, vrmRef, mixer, isLoaded, loadedAnimationNames, createAnimationClipFromVRMA } = useVrmModel(
    vrmUrl,
    animationUrls,
    onLoad
  );
  // const vrmRef = useRef<VRM | null>(null);
  // const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  // const [isLoaded, setIsLoaded] = useState(false); // Tracks VRM model loading
  const [bubbleText, setBubbleText] = useState<SpeakMessage | null>(null);
  const animationTimeoutRef = useRef<number | null>(null); // 3秒タイマー用ref: number型に修正

  // --- 疑似リップシンク状態 ---
  const [isLipSync, setIsLipSync] = useState(false);

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
                  onAnimationEnd(id, newAnimationName); // アニメーション終了を通知
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
          animationTimeoutRef.current = setTimeout(() => {
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
                  onAnimationEnd(id, newAnimationName); // アニメーション終了を通知
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

  // --- Expression Update ---
  const updateExpressions = useCallback(() => {
    const vrm = vrmRef.current;
    if (!vrm?.expressionManager) return;
    Object.entries(expressionWeights).forEach(([name, weight]) => {
      try {
        if (vrm.expressionManager?.getExpression(name as VRMExpressionPresetName)) {
          vrm.expressionManager.setValue(name as VRMExpressionPresetName, weight);
        }
      } catch (error) {
        console.warn(`Failed to set expression ${name} for ${vrmUrl}`, error);
      }
    });
  }, [vrmRef, expressionWeights, vrmUrl]);

  // --- Head Rotation Update ---
  const updateHeadRotation = useCallback(() => {
    const vrm = vrmRef.current;
    if (!vrm?.humanoid) return;
    const headBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
    if (headBone) {
      // Apply rotation relative to the default pose
      headBone.rotation.y = THREE.MathUtils.degToRad(headYaw);
    }
  }, [vrmRef, headYaw]);

  // --- Frame Update ---
  useFrame((_state, delta) => {
    const vrm = vrmRef.current;
    if (vrm) {
      updateExpressions();
      updateHeadRotation();
      mixer.current?.update(delta); // Update animation mixer
      vrm.update(delta); // Update VRM internal state (expressions, lookAt, physics)
    } // <-- Added missing closing brace
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
      playTTS(speechText.text, () => setIsLipSync(true)).then(() => {
        setBubbleText(null);
        setIsLipSync(false); // 再生終了でLipSync終了
        if (onTTSComplete && speechText.id) {
          onTTSComplete(id, speechText.id);
        }
      });
    }
    // クリーンアップ
    return () => {
      setIsLipSync(false);
    };
  }, [speechText, playTTS, onTTSComplete, id]);

  // 疑似リップシンクフック呼び出し
  usePseudoLipSync(isLoaded ? vrmRef.current : null, isLipSync);

  // Render only when VRM is loaded, applying the position
  return isLoaded && vrmRef.current ? (
    <primitive object={gltf.scene} position={position} dispose={null}>
      {/* Add SpeechBubble as a child, positioned relative to the avatar */}
      {bubbleText && <SpeechBubble message={bubbleText} />}
    </primitive>
  ) : null;
};
