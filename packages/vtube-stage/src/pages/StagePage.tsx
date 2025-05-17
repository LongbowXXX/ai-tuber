import React from 'react';
import { Canvas } from '@react-three/fiber';
import { VRMController } from '../components/VRMController';
import { SceneContent } from '../components/SceneContent';
import { Typography, Chip } from '@mui/material';
import styled from 'styled-components';
import { AnimatedCamera } from '../components/AnimatedCamera';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { AvatarState } from '../types/avatar_types';

interface StagePageProps {
  avatars: AvatarState[];
  setAvatars: React.Dispatch<React.SetStateAction<AvatarState[]>>;
  lastMessage: unknown;
  isConnected: boolean;
  onTTSComplete?: (avatarId: string, speakId: string) => void;
  onAnimationEnd?: (avatarId: string, animationName: string) => void;
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

const Sidebar = styled.div`
  width: 350px;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

const StatusBox = styled.div``;

const LastMessageBox = styled.div``;

const LastMessagePaper = styled.div`
  padding: 8px;
  max-height: 150px;
  overflow-y: auto;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
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

const CameraInit: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    let frame = 0;
    let raf: number;
    const setCamera = () => {
      camera.position.set(0, 5, 10);
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

const StagePage: React.FC<StagePageProps> = ({ avatars, setAvatars, lastMessage, isConnected, onTTSComplete }) => {
  // OrbitControls有効化のためのフラグ
  const [cameraAnimated, setCameraAnimated] = React.useState(false);
  // カメラアニメーション開始トリガー
  const [startCameraAnimation, setStartCameraAnimation] = React.useState(false);
  // Startボタンを押したかどうか
  const [started, setStarted] = React.useState(false);
  // 各アバターのロード完了IDを管理
  const [loadedAvatarIds, setLoadedAvatarIds] = React.useState<string[]>([]);

  // アバターのonLoadコールバック
  const handleAvatarLoad = React.useCallback((id: string) => {
    setLoadedAvatarIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  // 全員ロード完了でカメラアニメーション開始
  const allLoaded = avatars.length > 0 && loadedAvatarIds.length === avatars.length;

  // 全員ロード完了でカメラアニメーション開始（ディレイ付き）
  React.useEffect(() => {
    if (allLoaded && started && !startCameraAnimation && !cameraAnimated) {
      setStartCameraAnimation(true);
    }
    // allLoadedやstartedがfalseになったらリセット
    if (!allLoaded || !started) {
      setStartCameraAnimation(false);
    }
  }, [allLoaded, started, startCameraAnimation, cameraAnimated]);

  return (
    <Root>
      {/* Canvas Area */}
      <CanvasArea>
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }} shadows>
          {/* CameraInitコンポーネントを追加 */}
          <CameraInit />
          {/* AnimatedCameraは常にマウントし、内部でアニメーション状態を管理 */}
          <AnimatedCamera
            active={allLoaded && startCameraAnimation && !cameraAnimated}
            onFinish={() => setCameraAnimated(true)}
          />
          <SceneContent
            avatars={avatars}
            onTTSComplete={onTTSComplete}
            controlsEnabled={cameraAnimated}
            onAvatarLoad={handleAvatarLoad}
          />
        </Canvas>
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
        <Sidebar>
          <Typography variant="h6" component="h3">
            Stage Controls & Status
          </Typography>

          {/* Connection Status */}
          <StatusBox>
            <Typography component="span" variant="body1" sx={{ fontWeight: 'bold' }}>
              Connection Status:{' '}
            </Typography>
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
          </StatusBox>

          {/* Last Received Message */}
          <LastMessageBox>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Last Command from Server:
            </Typography>
            <LastMessagePaper>
              <Typography component="pre" sx={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                {lastMessage ? JSON.stringify(lastMessage, null, 2) : 'N/A'}
              </Typography>
            </LastMessagePaper>
          </LastMessageBox>

          {/* VRM Controllers */}
          {avatars.map(avatar => (
            <VRMController
              key={avatar.id}
              title={`Avatar ${avatar.id.replace('avatar', '')} Controls`}
              onExpressionChange={(name, weight) => {
                setAvatars(prevAvatars =>
                  prevAvatars.map(a =>
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
              onHeadYawChange={angle => {
                setAvatars(prevAvatars => prevAvatars.map(a => (a.id === avatar.id ? { ...a, headYaw: angle } : a)));
              }}
              onAnimationChange={animationName => {
                setAvatars(prevAvatars =>
                  prevAvatars.map(a => (a.id === avatar.id ? { ...a, currentAnimationName: animationName } : a))
                );
              }}
              availableAnimations={Object.keys(avatar.animationUrls)}
            />
          ))}
        </Sidebar>
      )}
    </Root>
  );
};

export default StagePage;
