import React from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneContent } from '../components/SceneContent';
import { DebugSidebar } from '../components/DebugSidebar';
import styled from 'styled-components';
import { AnimatedCamera } from '../components/AnimatedCamera';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { AvatarState } from '../types/avatar_types';
import { StageState } from '../types/scene_types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StagePageProps {
  avatars: AvatarState[];
  setAvatars: React.Dispatch<React.SetStateAction<AvatarState[]>>;
  stage: StageState;
  setStage: React.Dispatch<React.SetStateAction<StageState>>;
  lastMessage: unknown;
  isConnected: boolean;
}

// styled-components でスタイル定義
const Root = styled.div`
  display: flex;
  height: 100vh;
`;

const CanvasArea = styled.div`
  flex-grow: 1;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 1);
  z-index: 10;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const MarkdownOverlay = styled.div`
  position: absolute;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 80, 0, 0.7);
  color: white;
  a:link { color: white; }
  a:visited { color: white; }
  a:hover { color: white; }
  a:active { color: white; }
  padding: 8px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  text-align: left;
  font-size: 1.0rem;
  line-height: 1.1;
  overflow-y: auto;
`;

const CameraInit: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    let frame = 0;
    let raf: number;
    const setCamera = () => {
      camera.position.set(0, 1.2, 3);
      camera.lookAt(0, 1, 0);
      frame++;
      if (frame < 10) {
        raf = requestAnimationFrame(setCamera);
      }
    };
    setCamera();
    return () => {
      if (raf !== undefined) {
        cancelAnimationFrame(raf);
      }
    };
  }, [camera]);
  return null;
};

const StagePage: React.FC<StagePageProps> = ({ avatars, setAvatars, stage, setStage, lastMessage, isConnected }) => {
  // Startボタンを押したかどうか
  const [started, setStarted] = React.useState(false);
  // 各アバターのロード完了IDを管理
  const [loadedAvatarIds, setLoadedAvatarIds] = React.useState<string[]>([]);

  // アバターのonLoadコールバック
  const handleAvatarLoad = React.useCallback((id: string) => {
    setLoadedAvatarIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  // 全員ロード完了
  const allLoaded = avatars.length > 0 && loadedAvatarIds.length === avatars.length;

  return (
    <Root>
      {/* Canvas Area */}
      <CanvasArea>
        <Canvas camera={{ position: [0, 1.2, 3], fov: 50 }} shadows>
          {/* CameraInitコンポーネントを追加 */}
          {/* CameraInitコンポーネントを追加 (初期化時のみ) */}
          <CameraInit />

          {/* AnimatedCamera: stage.camera に基づいて制御 */}
          {(() => {
            // カメラ状態の構築
            let cameraState = null;
            if (stage.camera) {
              let targetPos: [number, number, number] | undefined = undefined;
              let targetAvatar: AvatarState | undefined = undefined; // Declare outside

              if (stage.camera.targetId) {
                // IDマッチング: 完全一致 -> "avatarX" == "targetId"
                // または "CharacterX" -> "avatarX" のようなマッピング、あるいは数値部分の一致など
                // 現状: "Character1" が来るが、アバターIDは "avatar1"
                targetAvatar = avatars.find(a => a.id === stage.camera!.targetId);

                if (!targetAvatar) {
                  // Fallback: CharacterX -> avatarX の変換を試みる
                  // 数値を抽出して、avatar + 数値 で検索
                  const match = stage.camera!.targetId!.match(/\d+$/);
                  if (match) {
                    const num = match[0];
                    targetAvatar = avatars.find(a => a.id === `avatar${num}`);
                  }
                }

                if (targetAvatar) {
                  targetPos = targetAvatar.position;
                } else {
                  console.warn(`Camera target not found: ${stage.camera.targetId}`);
                }
              }
              cameraState = {
                mode: stage.camera.mode,
                targetId: stage.camera.targetId,
                targetPosition: targetPos,
                targetHeight: targetAvatar?.height, // アバターの身長を渡す
                duration: stage.camera.duration,
                timestamp: stage.camera.timestamp,
              };
            }

            return <AnimatedCamera cameraState={cameraState} />;
          })()}

          <SceneContent avatars={avatars} controlsEnabled={true} onAvatarLoad={handleAvatarLoad} />
        </Canvas>
        {/* Markdown Overlay */}
        {stage.currentMarkdownText && (
          <MarkdownOverlay>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{stage.currentMarkdownText}</ReactMarkdown>
          </MarkdownOverlay>
        )}
        {/* ローディングオーバーレイ or Startボタン */}
        {!allLoaded && <LoadingOverlay>Loading...</LoadingOverlay>}
        {allLoaded && !started && (
          <LoadingOverlay>
            <button
              style={{
                fontSize: '2rem',
                padding: '1em 2em',
                borderRadius: '8px',
                border: 'none',
                background: '#1976d2',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onClick={() => setStarted(true)}
            >
              Start
            </button>
          </LoadingOverlay>
        )}
      </CanvasArea>
      {/* Controller/Sidebar Area */}
      {import.meta.env.VITE_DEBUG_SIDEBAR === 'true' && (
        <DebugSidebar
          avatars={avatars}
          setAvatars={setAvatars}
          stage={stage}
          setStage={setStage}
          lastMessage={lastMessage}
          isConnected={isConnected}
        />
      )}
    </Root>
  );
};

export default StagePage;
