// src/App.tsx (初期状態)
import { Canvas } from "@react-three/fiber";
import "./App.css";
import { useCallback, useState } from "react";
import { VRM } from "@pixiv/three-vrm";
import { VRMController } from "./components/VRMController";
import { SceneContent } from "./components/SceneContent";

function App() {
  const [vrm, setVrm] = useState<VRM | null>(null); // VRMインスタンスの状態
  // 表情のウェイトを保持するState (Record<string, number> 型を使用)
  const [expressionWeights, setExpressionWeights] = useState<
    Record<string, number>
  >({});
  // 頭の回転角度を保持するState
  const [headYaw, setHeadYaw] = useState<number>(0);

  // VRMインスタンスを取得するコールバック
  const handleLoad = useCallback((loadedVrm: VRM) => {
    setVrm(loadedVrm);
    // 初期表情状態を設定（任意）
    // const initialWeights: Record<string, number> = {};
    // if (loadedVrm.expressionManager) {
    //   loadedVrm.expressionManager.expressionMap.forEach((_, key) => {
    //     initialWeights[key] = 0;
    //   });
    // }
    // setExpressionWeights(initialWeights);
    console.log("App component received VRM instance.");
  }, []);

  // 表情UI変更時のハンドラ
  const handleExpressionChange = useCallback((name: string, weight: number) => {
    setExpressionWeights((prev) => ({ ...prev, [name]: weight }));
  }, []);

  // 頭の回転UI変更時のハンドラ
  const handleHeadYawChange = useCallback((angle: number) => {
    setHeadYaw(angle);
  }, []);

  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 1.2, 1.5], fov: 50 }} // カメラ初期位置調整
        shadows // 影を有効化
      >
        {/* Canvas の内部に SceneContent を配置し、必要な State とコールバックを渡す */}
        <SceneContent
          vrm={vrm} // VRMインスタンス (SceneContent内で更新ロジックに使用)
          expressionWeights={expressionWeights} // 表情ウェイト (SceneContent内で更新ロジックに使用)
          headYaw={headYaw} // 頭の角度 (SceneContent内で更新ロジックに使用)
          onLoad={handleLoad} // VRMロード完了時のコールバック (SceneContent経由でVRMAvatarへ)
        />
      </Canvas>
      {/* VRMコントローラーUI */}
      {vrm && ( // VRMがロードされてからUIを表示
        <VRMController
          onExpressionChange={handleExpressionChange}
          onHeadYawChange={handleHeadYawChange}
        />
      )}
    </div>
  );
}

export default App;
