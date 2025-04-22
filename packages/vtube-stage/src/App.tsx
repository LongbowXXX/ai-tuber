import { Canvas } from "@react-three/fiber";
import "./App.css";
import { useCallback, useState } from "react";
import { VRMController } from "./components/VRMController";
import { SceneContent } from "./components/SceneContent";

// Define the structure for a single avatar's state
interface AvatarState {
  id: string;
  vrmUrl: string;
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string;
}

function App() {
  // State now holds an array of avatar states. Initialize with one avatar.
  const [avatars, setAvatars] = useState<AvatarState[]>([
    {
      id: "avatar1",
      vrmUrl: "/avatar.vrm", // Default VRM
      animationUrls: { idle: "/idle.vrma", wave: "/wave.vrma" },
      expressionWeights: { neutral: 0.1 }, // Initial neutral expression
      headYaw: 0,
      currentAnimationName: "idle",
    },
  ]);

  // --- Handlers --- (Modified to update the first avatar for now)
  // In a multi-avatar setup, these would need an avatar ID parameter

  const handleExpressionChange = useCallback((name: string, weight: number) => {
    setAvatars((prevAvatars) =>
      prevAvatars.map((avatar, index) =>
        index === 0 // Target the first avatar
          ? {
              ...avatar,
              expressionWeights: {
                ...avatar.expressionWeights,
                [name]: weight,
              },
            }
          : avatar
      )
    );
  }, []);

  const handleHeadYawChange = useCallback((angle: number) => {
    setAvatars((prevAvatars) =>
      prevAvatars.map((avatar, index) =>
        index === 0 ? { ...avatar, headYaw: angle } : avatar
      )
    );
  }, []);

  const handleAnimationChange = useCallback((animationName: string) => {
    console.log(`App: Changing animation for avatar 0 to: ${animationName}`);
    setAvatars((prevAvatars) =>
      prevAvatars.map((avatar, index) =>
        index === 0
          ? { ...avatar, currentAnimationName: animationName }
          : avatar
      )
    );
  }, []);

  // --- Rendering ---
  return (
    <div id="canvas-container">
      <Canvas camera={{ position: [0, 1.2, 1.5], fov: 50 }} shadows>
        {/* Pass the entire avatars array to SceneContent */}
        <SceneContent avatars={avatars} />
      </Canvas>

      {/* Controller UI - For now, controls the first avatar */}
      {/* In a multi-avatar setup, you might need multiple controllers or a way to select the target avatar */}
      {avatars.length > 0 && ( // Show controller if there's at least one avatar
        <VRMController
          onExpressionChange={handleExpressionChange}
          onHeadYawChange={handleHeadYawChange}
          onAnimationChange={handleAnimationChange}
          // Provide available animations from the first avatar's config
          availableAnimations={Object.keys(avatars[0].animationUrls)}
        />
      )}
    </div>
  );
}

export default App;
