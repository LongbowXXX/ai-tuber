import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// カスタムパーティクル: 真円のテクスチャを生成して使用
interface CustomSparklesProps {
  color: string;
  count?: number;
  minSpeed?: number;
  maxSpeed?: number;
  swayX?: number;
  swayZ?: number;
}

export const CustomSparkles: React.FC<CustomSparklesProps> = ({
  color,
  count = 50,
  minSpeed = 0.005,
  maxSpeed = 0.015,
  swayX = 0.5,
  swayZ = 0.3,
}) => {
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
  const { initialPositions, speeds, phrases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count); // Y軸方向の速度
    const ph = new Float32Array(count); // 揺れの位相

    for (let i = 0; i < count; i++) {
      // 広範囲に散らす
      pos[i * 3] = (Math.random() - 0.5) * 10; // X: -5 ~ 5
      pos[i * 3 + 1] = Math.random() * 5; // Y: 0 ~ 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z: -5 ~ 5

      const speedRange = maxSpeed - minSpeed;
      spd[i] = minSpeed + Math.random() * speedRange;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { initialPositions: pos, speeds: spd, phrases: ph };
  }, [count, minSpeed, maxSpeed]);

  // アニメーションループ
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const positionsAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;

    // Safety check in case attribute is not ready
    if (!positionsAttribute) return;

    const time = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Y軸: 上昇
      let y = positionsAttribute.getY(i);
      y += speeds[i];
      if (y > 5) {
        y = 0;
      }
      positionsAttribute.setY(i, y);

      // X軸: 左右にゆらゆら揺れる (初期位置を中心に、時間経過と位相でサイン波)
      const initialX = initialPositions[i * 3];
      const swayValX = Math.sin(time * 0.5 + phrases[i]) * swayX;
      positionsAttribute.setX(i, initialX + swayValX);

      // Z軸: 奥行きも少し揺らすとより立体的になる
      const initialZ = initialPositions[i * 3 + 2];
      const swayValZ = Math.cos(time * 0.3 + phrases[i]) * swayZ;
      positionsAttribute.setZ(i, initialZ + swayValZ);
    }
    positionsAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions.slice(), 3]} // copy to avoid mutation issues if any
        />
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
