// src/components/SceneContent.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import { OrbitControls, Environment, Sparkles, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { VRMAvatar } from './VRMAvatar';
import { VRM } from '@pixiv/three-vrm';
import { AvatarState } from '../types/avatar_types';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Define a type for the data needed for each avatar
interface AvatarData extends AvatarState {
  onLoad?: (vrm: VRM) => void; // Optional onLoad callback per avatar
}

interface SceneContentProps {
  avatars: AvatarData[]; // Array of avatar data objects
  controlsEnabled?: boolean; // OrbitControls有効化フラグ
  onAvatarLoad?: (id: string) => void;
}

const EMOTION_COLORS: { [key: string]: string } = {
  neutral: '#CEF', // 水色 (Default)
  happy: '#FFD700', // Gold
  sad: '#4169E1', // Royal Blue
  angry: '#FF4500', // Red Orange
  relaxed: '#98FB98', // Pale Green
  Surprised: '#FFFF00', // Yellow
};

export const SceneContent: React.FC<SceneContentProps> = ({ avatars, controlsEnabled = true, onAvatarLoad }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // 初期ターゲットを設定（一度だけ）
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  }, []);

  // エモーションに合わせて色変化
  const sparkleColor = useMemo(() => {
    // "neutral" 以外のエモーションを持つアバターを優先し、後勝ち（リストの後ろの方）で採用
    // 見つからなければ最後のアバター（全員 neutral なら誰でも同じなので）
    const emotionalAvatar = [...avatars].reverse().find(a => a.currentEmotion && a.currentEmotion !== 'neutral');
    const activeAvatar = emotionalAvatar || avatars[avatars.length - 1];
    const emotion = activeAvatar?.currentEmotion || 'neutral';

    return EMOTION_COLORS[emotion] || '#CEF';
  }, [avatars]);

  // --- Scene elements rendering ---
  return (
    <>
      {/* 1. 環境・背景設定 */}
      <color attach="background" args={['#202020']} />
      <Environment files="/background.jpg" background />

      {/* 2. ライティング強化 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 3. エフェクト（パーティクル） */}
      <Sparkles count={50} scale={4} size={4} speed={0.4} opacity={0.5} color={sparkleColor} position={[0, 1, 0]} />

      {/* 4. 床の改善: PlaneGeometryの代わりにContactShadowsを使用 */}
      {/* 元のmesh床は削除または非表示にし、より自然な影を落とす */}
      <ContactShadows
        opacity={0.7}
        scale={10}
        blur={1.5}
        far={4}
        resolution={512}
        color="#000000"
        position={[0, 0.01, 0]}
      />
      {/* アバター描画 */}
      {avatars.map(avatar => (
        <VRMAvatar key={avatar.id} {...avatar} onLoad={onAvatarLoad ? () => onAvatarLoad(avatar.id) : undefined} />
      ))}
      {/* 5. ポストプロセス効果: 画面全体のクオリティアップ */}
      <EffectComposer>
        {/* Bloom: 明るい部分を光らせる（アニメ調の肌や目に効果的） */}
        <Bloom
          luminanceThreshold={1.2} // 光り始める閾値
          mipmapBlur
          intensity={0.4}
          radius={0.6}
        />
        {/* Vignette: 四隅を暗くしてシネマティックに */}
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
      {/* Camera Controls */}
      {controlsEnabled && <OrbitControls ref={controlsRef} makeDefault />}
    </>
  );
};
