import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// カスタムパーティクル: 真円のテクスチャを生成して使用
export const CustomSparkles: React.FC<{ color: string; count?: number }> = ({ color, count = 50 }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // 円形ぼかしテクスチャの生成 (useMemoで再利用)
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // パーティクルの初期位置生成
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count); // Y軸方向の速度

    for (let i = 0; i < count; i++) {
      // 広範囲に散らす
      pos[i * 3] = (Math.random() - 0.5) * 10; // X: -5 ~ 5
      pos[i * 3 + 1] = Math.random() * 5; // Y: 0 ~ 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z: -5 ~ 5

      spd[i] = 0.005 + Math.random() * 0.01;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  // アニメーションループ
  useFrame(() => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const positionsAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;

    // Safety check in case attribute is not ready
    if (!positionsAttribute) return;

    for (let i = 0; i < count; i++) {
      // 上昇アニメーション
      let y = positionsAttribute.getY(i);
      y += speeds[i];

      // 画面外に出たら下に戻す
      if (y > 5) {
        y = 0;
      }
      positionsAttribute.setY(i, y);
    }
    positionsAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15} // サイズ調整
        color={color}
        map={particleTexture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </points>
  );
};
