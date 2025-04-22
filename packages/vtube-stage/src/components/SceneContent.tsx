// src/components/SceneContent.tsx
import React from "react";
import { OrbitControls } from "@react-three/drei";
import { VRMAvatar } from "./VRMAvatar";
import { VRM } from "@pixiv/three-vrm"; // Keep VRM type for AvatarData

// Define a type for the data needed for each avatar
interface AvatarData {
  id: string; // Unique identifier for the avatar
  vrmUrl: string;
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string;
  onLoad?: (vrm: VRM) => void; // Optional onLoad callback per avatar
}

interface SceneContentProps {
  avatars: AvatarData[]; // Array of avatar data objects
}

export const SceneContent: React.FC<SceneContentProps> = ({ avatars }) => {
  // --- Scene elements rendering ---
  return (
    <>
      {/* Environment Light */}
      <ambientLight intensity={0.8} />
      {/* Directional Light */}
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="grey" />
      </mesh>

      {/* Render each VRM Avatar based on the avatars prop */}
      {avatars.map((avatar) => (
        <VRMAvatar
          key={avatar.id} // Use unique ID as key
          vrmUrl={avatar.vrmUrl}
          animationUrls={avatar.animationUrls}
          expressionWeights={avatar.expressionWeights}
          headYaw={avatar.headYaw}
          currentAnimationName={avatar.currentAnimationName}
          onLoad={avatar.onLoad} // Pass down individual onLoad if provided
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls target={[0, 1, 0]} />
    </>
  );
};
