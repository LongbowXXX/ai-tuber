import { Canvas } from "@react-three/fiber";
import "./App.css";
import { useState } from "react";
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
  position: [number, number, number]; // Add position
}

function App() {
  // State now holds an array of avatar states. Initialize with two avatars.
  const [avatars, setAvatars] = useState<AvatarState[]>([
    {
      id: "avatar1",
      vrmUrl: "/avatar.vrm",
      animationUrls: { idle: "/idle.vrma", wave: "/wave.vrma" },
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: "idle",
      position: [-0.5, 0, 0], // Position for first avatar
    },
    {
      id: "avatar2",
      vrmUrl: "/avatar2.vrm", // Use avatar2.vrm
      animationUrls: { idle: "/idle.vrma", wave: "/wave.vrma" }, // Assuming same animations for now
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: "idle",
      position: [0.5, 0, 0], // Position for second avatar
    },
  ]);

  // --- Rendering ---
  return (
    <div id="app-container">
      {" "}
      {/* Changed ID for clarity */}
      <div id="canvas-container">
        <Canvas camera={{ position: [0, 1.2, 2.5], fov: 50 }} shadows>
          {/* Pass the entire avatars array to SceneContent */}
          <SceneContent avatars={avatars} />
        </Canvas>
      </div>
      {/* Controller UI Area */}
      <div className="controllers-area">
        {avatars.map((avatar) => (
          <VRMController
            key={avatar.id} // Crucial for React to differentiate instances
            title={`Avatar ${avatar.id.replace("avatar", "")} Controls`} // Add a title
            // Define handlers directly here, ensuring they close over the correct 'avatar.id'
            onExpressionChange={(name, weight) => {
              setAvatars((prevAvatars) =>
                prevAvatars.map((a) =>
                  a.id === avatar.id
                    ? {
                        ...a,
                        expressionWeights: {
                          ...a.expressionWeights,
                          [name]: weight,
                        },
                      }
                    : a
                )
              );
            }}
            onHeadYawChange={(angle) => {
              setAvatars((prevAvatars) =>
                prevAvatars.map((a) =>
                  a.id === avatar.id ? { ...a, headYaw: angle } : a
                )
              );
            }}
            onAnimationChange={(animationName) => {
              setAvatars((prevAvatars) =>
                prevAvatars.map((a) =>
                  a.id === avatar.id
                    ? { ...a, currentAnimationName: animationName }
                    : a
                )
              );
            }}
            availableAnimations={Object.keys(avatar.animationUrls)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
