import React from 'react';
import { Canvas } from '@react-three/fiber';
import { VRMController } from '../components/VRMController';
import { SceneContent } from '../components/SceneContent';
import { Typography, Chip } from '@mui/material';
import { InternalAvatarState } from '../hooks/useStageCommandHandler';
import styled from 'styled-components';

interface StagePageProps {
  avatars: InternalAvatarState[];
  setAvatars: React.Dispatch<React.SetStateAction<InternalAvatarState[]>>;
  lastMessage: unknown;
  isConnected: boolean;
  onTTSComplete?: (speakId: string) => void; // 追加
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

const StagePage: React.FC<StagePageProps> = ({ avatars, setAvatars, lastMessage, isConnected, onTTSComplete }) => {
  return (
    <Root>
      {/* Canvas Area */}
      <CanvasArea>
        <Canvas camera={{ position: [0, 1.2, 3], fov: 50 }} shadows>
          <SceneContent avatars={avatars} onTTSComplete={onTTSComplete} />
        </Canvas>
      </CanvasArea>
      {/* Controller/Sidebar Area */}
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
    </Root>
  );
};

export default StagePage;
