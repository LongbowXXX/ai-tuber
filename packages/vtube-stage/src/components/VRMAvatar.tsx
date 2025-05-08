// src/components/VRMAvatar.tsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { VRM, VRMLoaderPlugin, VRMUtils, VRMExpressionPresetName, VRMHumanBoneName } from '@pixiv/three-vrm';
import { createVRMAnimationClip, VRMAnimation, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SpeechBubble } from './SpeechBubble'; // Import the SpeechBubble component

// --- Constants ---
const ANIMATION_FADE_DURATION = 0.3;

interface VRMAvatarProps {
  vrmUrl: string;
  // Animation URLs (example: { idle: '/idle.vrma', wave: '/wave.vrma' })
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string | null; // Allow currentAnimationName to be string or null
  speechText?: string; // Add speechText prop
  position?: [number, number, number]; // Add position prop
  onLoad?: (vrm: VRM) => void; // Keep onLoad for potential external use, but internal logic won't depend on it passing upwards
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({
  vrmUrl,
  animationUrls,
  expressionWeights,
  headYaw,
  currentAnimationName,
  speechText = '', // Default to empty string
  position = [0, 0, 0], // Default position if not provided
  onLoad, // Keep prop signature
}) => {
  const vrmRef = useRef<VRM | null>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const vrmAnimations = useRef<Record<string, VRMAnimation>>({});
  const [loadedAnimationNames, setLoadedAnimationNames] = useState(new Set<string>());
  const [isLoaded, setIsLoaded] = useState(false); // Tracks VRM model loading
  const [bubbleText, setBubbleText] = useState(speechText);

  // --- VRM Loader ---
  const gltf = useLoader(GLTFLoader, vrmUrl, loader => {
    loader.register(parser => new VRMLoaderPlugin(parser));
  });

  // --- VRMA Animation Loader ---
  const vrmaLoader = useMemo(() => {
    const loader = new GLTFLoader();
    loader.register(parser => new VRMAnimationLoaderPlugin(parser));
    return loader;
  }, []);

  // --- Load Single Animation ---
  const loadAnimation = useCallback(
    async (name: string, url: string) => {
      try {
        const animGltf = await vrmaLoader.loadAsync(url);
        const animation = animGltf.userData.vrmAnimations?.[0] as VRMAnimation | undefined;
        if (animation) {
          console.log(`Loaded ${name} VRMA animation for ${vrmUrl}:`, animation);
          vrmAnimations.current[name] = animation;
          setLoadedAnimationNames(prev => new Set(prev).add(name));
          return animation;
        } else {
          console.warn(`Animation not found in ${url}`);
          return null;
        }
      } catch (error) {
        // Keep error parameter for logging
        console.error(`Error loading ${name} animation from ${url}:`, error); // Log the error
        return null;
      }
    },
    [vrmaLoader, vrmUrl] // Include vrmUrl in dependency if needed, though loader is stable
  );

  // --- Load All Animations ---
  useEffect(() => {
    Object.entries(animationUrls).forEach(([name, url]) => {
      if (!loadedAnimationNames.has(name)) {
        loadAnimation(name, url);
      }
    });
  }, [animationUrls, loadAnimation, loadedAnimationNames]);

  // --- VRM Setup ---
  useEffect(() => {
    if (gltf.userData.vrm && !vrmRef.current) {
      const vrm: VRM = gltf.userData.vrm;
      VRMUtils.rotateVRM0(vrm);
      gltf.scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      console.log(`VRM loaded from ${vrmUrl}:`, vrm);
      vrmRef.current = vrm;
      mixer.current = new THREE.AnimationMixer(vrm.scene); // Create mixer here
      setIsLoaded(true); // Mark VRM as loaded
      if (onLoad) {
        onLoad(vrm); // Call external onLoad if provided
      }
    }
    // Cleanup
    return () => {
      if (vrmRef.current) {
        mixer.current?.stopAllAction();
        VRMUtils.deepDispose(vrmRef.current.scene);
        vrmRef.current = null;
        mixer.current = null;
        currentAction.current = null;
        setIsLoaded(false);
        setLoadedAnimationNames(new Set()); // Reset loaded animations
        vrmAnimations.current = {};
        console.log(`Cleaned up VRM from ${vrmUrl}`);
      }
    };
  }, [gltf, onLoad, vrmUrl]); // Add vrmUrl to dependencies

  // --- Create Animation Clip ---
  const createAnimationClipFromVRMA = useCallback(
    (animationName: string): THREE.AnimationClip | null => {
      const vrm = vrmRef.current;
      if (vrm && vrmAnimations.current[animationName]) {
        return createVRMAnimationClip(vrmAnimations.current[animationName], vrm);
      }
      return null;
    },
    [] // Depends only on refs, no need to list vrmRef here
  );

  // --- Animation Switching ---
  useEffect(() => {
    const vrm = vrmRef.current;
    const currentMixer = mixer.current;
    // Ensure VRM, Mixer exist and the target animation is loaded
    if (!vrm || !currentMixer || !currentAnimationName || !loadedAnimationNames.has(currentAnimationName)) {
      return;
    }

    const clip = createAnimationClipFromVRMA(currentAnimationName);

    if (clip) {
      const newAction = currentMixer.clipAction(clip);

      if (currentAction.current?.getClip() !== clip) {
        if (currentAction.current) {
          currentAction.current.fadeOut(ANIMATION_FADE_DURATION);
        }

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
              }
            }
          };
          newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(ANIMATION_FADE_DURATION).play();
          currentAction.current = newAction;
          currentMixer.addEventListener('finished', onFinished);
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
    }
  }, [
    currentAnimationName,
    createAnimationClipFromVRMA,
    loadedAnimationNames,
    vrmUrl, // Add vrmUrl for logging clarity
  ]);

  // --- Expression Update ---
  const updateExpressions = useCallback(() => {
    const vrm = vrmRef.current;
    if (!vrm?.expressionManager) return;
    Object.entries(expressionWeights).forEach(([name, weight]) => {
      try {
        // Ensure the expression name is valid before setting
        if (vrm.expressionManager!.getExpression(name as VRMExpressionPresetName)) {
          vrm.expressionManager!.setValue(name as VRMExpressionPresetName, weight);
        } // Removed unnecessary else block
      } catch (error) {
        // Keep error parameter for logging
        console.warn(`Failed to set expression ${name} for ${vrmUrl}`, error); // Log warning with error
      }
    });
  }, [expressionWeights, vrmUrl]); // Added vrmUrl back for logging

  // --- Head Rotation Update ---
  const updateHeadRotation = useCallback(() => {
    const vrm = vrmRef.current;
    if (!vrm?.humanoid) return;
    const headBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
    if (headBone) {
      // Apply rotation relative to the default pose
      headBone.rotation.y = THREE.MathUtils.degToRad(headYaw);
    }
  }, [headYaw]);

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

  // TTS再生関数（ダミー: 3秒待つ）
  const playTTS = useCallback(async (text: string) => {
    // 引数textをログ出力して警告を回避
    console.log('[TTS] playTTS called with text:', text);
    await new Promise(resolve => setTimeout(resolve, 8000));
  }, []);

  // speechTextが変化したらTTS再生→終了後に吹き出しを閉じる
  useEffect(() => {
    if (speechText && speechText !== '') {
      setBubbleText(speechText);
      playTTS(speechText).then(() => {
        setBubbleText('');
      });
    }
  }, [speechText, playTTS]);

  // Render only when VRM is loaded, applying the position
  return isLoaded && vrmRef.current ? (
    <primitive object={gltf.scene} position={position} dispose={null}>
      {/* Add SpeechBubble as a child, positioned relative to the avatar */}
      {bubbleText && <SpeechBubble text={bubbleText} />}
    </primitive>
  ) : null;
};
