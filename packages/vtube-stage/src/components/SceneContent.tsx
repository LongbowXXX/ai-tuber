// src/components/SceneContent.tsx
import React, { useRef, useEffect, useMemo, Suspense, useState } from 'react';
import * as THREE from 'three';
import {
  OrbitControls,
  Sky,
  MeshReflectorMaterial,
  Float,
  Text3D,
  Cloud,
  Clouds,
  Grid,
  SpotLight,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Glitch,
  Scanline,
  Noise,
} from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import { VRMAvatar } from './VRMAvatar';
import { VRM } from '@pixiv/three-vrm';
import { AvatarState } from '../types/avatar_types';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CustomSparkles } from './CustomSparkles';
import { VisualEffectsConfig } from '../types/scene_types';

// Define a type for the data needed for each avatar
interface AvatarData extends AvatarState {
  onLoad?: (vrm: VRM) => void; // Optional onLoad callback per avatar
}

interface SceneContentProps {
  avatars: AvatarData[]; // Array of avatar data objects
  controlsEnabled?: boolean; // OrbitControls有効化フラグ
  onAvatarLoad?: (id: string) => void;
  activeCharacterId?: string; // 現在注目されているキャラクターID
}

const EMOTION_COLORS: { [key: string]: string } = {
  neutral: '#CEF', // 水色 (Default)
  happy: '#FFD700', // Gold
  sad: '#4169E1', // Royal Blue
  angry: '#FF4500', // Red Orange
  relaxed: '#98FB98', // Pale Green
  Surprised: '#FFFF00', // Yellow
};

export const SceneContent: React.FC<SceneContentProps> = ({
  avatars,
  controlsEnabled = true,
  onAvatarLoad,
  activeCharacterId,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [effectsConfig, setEffectsConfig] = useState<VisualEffectsConfig | null>(null);

  // 初期ターゲットを設定（一度だけ）
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  }, []);

  // 設定ファイルの読み込み
  useEffect(() => {
    fetch('/visual_effects.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load visual_effects.json');
        return res.json();
      })
      .then(data => {
        setEffectsConfig(data);
      })
      .catch(err => {
        console.error('Failed to load visual effects config:', err);
      });
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

  // アクティブなキャラクターの情報を取得
  const activeAvatar = useMemo(() => {
    if (!activeCharacterId) return null;
    return avatars.find(a => a.id === activeCharacterId);
  }, [avatars, activeCharacterId]);

  // 安定したターゲットオブジェクトを作成（マウント時に一度だけ）
  const [lightTarget] = useState(() => new THREE.Object3D());

  // activeAvatarが変わったらターゲットの位置を更新
  useEffect(() => {
    if (activeAvatar) {
      lightTarget.position.set(activeAvatar.position[0], 1.2, activeAvatar.position[2]);
    }
  }, [activeAvatar, lightTarget]);

  // --- Scene elements rendering ---
  return (
    <>
      {/* 1. 環境・背景設定 */}
      <color attach="background" args={['#202020']} />
      <Sky
        sunPosition={[100, 2, 100]} // 地平線近くに設定
        inclination={0}
        azimuth={0.25}
        rayleigh={5} // 夕焼けっぽく赤みを強める
      />
      <Suspense fallback={null}>
        <Clouds material={THREE.MeshLambertMaterial}>
          <Cloud position={[0, 10, -30]} speed={0.1} opacity={0.2} seed={1} scale={1} color="#ff7e5f" fade={10} />
          <Cloud position={[10, 5, -20]} speed={0.2} opacity={0.1} seed={2} color="#feb47b" fade={10} />
          <Cloud position={[-5, 3, -10]} speed={0.3} opacity={0.1} seed={3} color="#feb47b" fade={10} />
        </Clouds>
      </Suspense>

      {/* 2. ライティング強化 */}
      <ambientLight intensity={0.5} color="#ffdfba" />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* スポットライトターゲット（常にシーンに存在させる） */}
      <primitive object={lightTarget} />

      {/* スポットライト (Active Character) - sad, angry, Surprised の時のみ点灯 */}
      {(() => {
        const shouldShowSpotlight =
          activeAvatar && ['sad', 'angry', 'Surprised'].includes(activeAvatar.currentEmotion || '');

        return (
          <SpotLight
            position={[activeAvatar?.position[0] ?? 0, 5, (activeAvatar?.position[2] ?? 0) + 0.5]} // キャラクターのほぼ直上（少し手前）
            target={lightTarget}
            angle={0.4} // 少し広げる
            penumbra={0.5} // ぼかし
            intensity={shouldShowSpotlight ? 8 : 0} // 条件に合致するときのみ点灯
            color={sparkleColor}
            castShadow={false}
            distance={20}
            opacity={shouldShowSpotlight ? 0.8 : 0} // 条件に合致するときのみボリューメトリック表示
          />
        );
      })()}

      {/* 3. エフェクト（パーティクル） */}
      {/* CustomSparkles に置き換え: 四角い枠問題を解消 */}
      <CustomSparkles color={sparkleColor} count={60} />

      {/* 4. 床の改善: MeshReflectorMaterialで鏡面反射 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[13.25, 13.25]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>

      {/* サイバー風グリッド床 */}
      <Grid
        position={[0, 0.01, 0]} // 床のわずかに下
        args={[10.5, 10.5]} // グリッド全体のサイズ
        cellSize={0.6} // 小さいマスのサイズ
        cellThickness={1} // 小さいマスの線の太さ
        cellColor="#6f6f6f" // 小さいマスの色
        sectionSize={3.3} // 大きい区切りのサイズ
        sectionThickness={1.5} // 大きい区切りの線の太さ
        sectionColor="#9d4b4b" // 大きい区切りの色（赤や青に変えると雰囲気が激変します）
        fadeDistance={30} // 奥の方をフェードアウトさせる距離
        fadeStrength={1}
        followCamera={false}
        infiniteGrid // どこまでカメラが動いても床が続く
      />

      {/* 5. 空間演出: 浮遊するテキストとオブジェクト */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text3D
          font="/fonts/rounded_mplus_1c_regular.json"
          size={0.5}
          height={0.15} // 奥行き (Thickness)
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          position={[-2.5, 1.5, -2]} // 中央揃えがText3Dは難しいので位置調整
          rotation={[-0.3, 0.4, 0]}
        >
          ON AIR
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#0055FF"
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Text3D>
      </Float>

      <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
        <mesh position={[2, 1, -1]} rotation={[-0.2, -0.5, 0]}>
          <torusGeometry args={[0.3, 0.1, 16, 32]} />
          <meshStandardMaterial color="#E8ABBE" emissive="#FF69B4" emissiveIntensity={2} />
        </mesh>
      </Float>

      {/* アバター描画 */}
      {avatars.map(avatar => (
        <VRMAvatar key={avatar.id} {...avatar} onLoad={onAvatarLoad ? () => onAvatarLoad(avatar.id) : undefined} />
      ))}

      {/* 6. ポストプロセス効果: 画面全体のクオリティアップ */}
      <EffectComposer>
        <>
          {/* Bloom: 明るい部分を光らせる（アニメ調の肌や目に効果的） */}
          {effectsConfig?.bloom.enabled && (
            <Bloom
              luminanceThreshold={effectsConfig.bloom.luminanceThreshold} // 光り始める閾値
              mipmapBlur={effectsConfig.bloom.mipmapBlur}
              intensity={effectsConfig.bloom.intensity}
              radius={effectsConfig.bloom.radius}
            />
          )}
          {/* Vignette: 四隅を暗くしてシネマティックに */}
          {effectsConfig?.vignette.enabled && (
            <Vignette
              eskil={effectsConfig.vignette.eskil}
              offset={effectsConfig.vignette.offset}
              darkness={effectsConfig.vignette.darkness}
            />
          )}

          {/* 色収差 */}
          {effectsConfig?.chromaticAberration.enabled && (
            <ChromaticAberration
              offset={effectsConfig.chromaticAberration.offset} // ずらす量（0.001~0.005くらいが上品）
              radialModulation={effectsConfig.chromaticAberration.radialModulation}
              modulationOffset={effectsConfig.chromaticAberration.modulationOffset} // 中心からどれくらい離れたら収差が出始めるか
            />
          )}

          {/* 時々走るデジタルノイズ */}
          {effectsConfig?.glitch.enabled && (
            <Glitch
              delay={new THREE.Vector2(...effectsConfig.glitch.delay)} // ノイズが発生しない間隔（秒）のランダム範囲
              duration={new THREE.Vector2(...effectsConfig.glitch.duration)} // ノイズが続いている時間（秒）。短めがおすすめ
              strength={new THREE.Vector2(...effectsConfig.glitch.strength)} // ノイズの強さ。弱めにしておくと「通信障害」っぽくてリアル
              mode={effectsConfig.glitch.mode === 'SPORADIC' ? GlitchMode.SPORADIC : GlitchMode.CONSTANT_MILD} // SPORADIC = 間欠的（ランダム）に発生
              active={effectsConfig.glitch.active}
              ratio={effectsConfig.glitch.ratio} // ノイズの発生確率（しきい値）
            />
          )}

          {/* モニター風の走査線 */}
          {effectsConfig?.scanline.enabled && (
            <Scanline
              density={effectsConfig.scanline.density} // 線の密度
              opacity={effectsConfig.scanline.opacity} // 0.05〜0.1 くらいのごく薄い値にするのがコツ
            />
          )}

          {/* フィルム粒子のようなザラつき */}
          {effectsConfig?.noise.enabled && (
            <Noise
              opacity={effectsConfig.noise.opacity} // こちらも0.02〜0.05くらいで「隠し味」程度に
            />
          )}
        </>
      </EffectComposer>
      {/* Camera Controls */}
      {controlsEnabled && <OrbitControls ref={controlsRef} makeDefault />}
    </>
  );
};
