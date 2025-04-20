// src/App.tsx (初期状態)
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // カメラ操作用
import "./App.css";
import { useState } from "react";
import { VRM } from "@pixiv/three-vrm";
import { VRMAvatar } from "./components/VRMAvatar";

function App() {
  const [vrm, setVrm] = useState<VRM | null>(null); // VRMインスタンスの状態

  const handleLoad = (loadedVrm: VRM) => {
    setVrm(loadedVrm);
    console.log("App component received VRM instance.");
  };
  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 1.2, 1.5], fov: 50 }} // カメラ初期位置調整
        shadows // 影を有効化
      >
        {/* 環境光 */}
        <ambientLight intensity={0.8} />
        {/* 平行光源 (影を落とす) */}
        <directionalLight
          position={[3, 5, 2]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* 床 (影を受け取る) */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="grey" />
        </mesh>

        {/* VRMアバターコンポーネント */}
        <VRMAvatar vrmUrl="/avatar.vrm" onLoad={handleLoad} />

        {/* カメラ操作を可能にする */}
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
      {/* ここに制御UIを追加していく */}
    </div>
  );
}

export default App;
