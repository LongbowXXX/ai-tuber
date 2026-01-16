import React from 'react';
import { Typography, Chip, Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';
import styled from 'styled-components';
import { VRMController } from './VRMController';
import { AvatarState } from '../types/avatar_types';
import { StageState } from '../types/scene_types';

interface DebugSidebarProps {
  avatars: AvatarState[];
  setAvatars: React.Dispatch<React.SetStateAction<AvatarState[]>>;
  stage: StageState;
  setStage: React.Dispatch<React.SetStateAction<StageState>>;
  lastMessage: unknown;
  isConnected: boolean;
}

// styled-components でスタイル定義
const SidebarContainer = styled.div`
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

const CameraControlBox = styled.div`
  padding: 12px;
  background: #f0f4f8;
  border: 1px solid #d0d8e0;
  border-radius: 8px;
`;

export const DebugSidebar: React.FC<DebugSidebarProps> = ({
  avatars,
  setAvatars,
  stage,
  setStage,
  lastMessage,
  isConnected,
}) => {
  // カメラコントロール用ローカル状態
  const [cameraMode, setCameraMode] = React.useState<'default' | 'intro' | 'closeUp'>('default');
  const [targetId, setTargetId] = React.useState<string>('');

  // カメラ位置変更を適用
  const handleApplyCamera = () => {
    setStage(prevStage => ({
      ...prevStage,
      camera: {
        mode: cameraMode,
        targetId: cameraMode === 'closeUp' ? targetId : undefined,
        duration: 1, // 秒単位
        timestamp: Date.now(),
      },
    }));
  };

  return (
    <SidebarContainer>
      <Typography variant="h6" component="h3">
        Stage Controls &amp; Status
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

      {/* Camera Controls */}
      <CameraControlBox>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Camera Controls
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="camera-mode-label">Mode</InputLabel>
            <Select
              labelId="camera-mode-label"
              value={cameraMode}
              label="Mode"
              onChange={e => setCameraMode(e.target.value as 'default' | 'intro' | 'closeUp')}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="intro">Intro</MenuItem>
              <MenuItem value="closeUp">Close Up</MenuItem>
            </Select>
          </FormControl>
          {cameraMode === 'closeUp' && (
            <FormControl size="small" fullWidth>
              <InputLabel id="target-id-label">Target</InputLabel>
              <Select
                labelId="target-id-label"
                value={targetId}
                label="Target"
                onChange={e => setTargetId(e.target.value)}
              >
                {avatars.map(avatar => (
                  <MenuItem key={avatar.id} value={avatar.id}>
                    {avatar.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button variant="contained" size="small" onClick={handleApplyCamera}>
            Apply Camera
          </Button>
          {/* 現在のカメラ状態表示 */}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Current:{' '}
            {stage.camera
              ? `${stage.camera.mode}${stage.camera.targetId ? ` → ${stage.camera.targetId}` : ''}`
              : 'None'}
          </Typography>
        </Box>
      </CameraControlBox>

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
          onEmotionChange={name => {
            setAvatars(prevAvatars =>
              prevAvatars.map(a =>
                a.id === avatar.id
                  ? {
                      ...a,
                      currentEmotion: name,
                    }
                  : a
              )
            );
          }}
          onAnimationChange={animationName => {
            setAvatars(prevAvatars =>
              prevAvatars.map(a => (a.id === avatar.id ? { ...a, currentAnimationName: animationName } : a))
            );
          }}
          availableAnimations={Object.keys(avatar.animationUrls)}
          currentEmotion={avatar.currentEmotion}
        />
      ))}
    </SidebarContainer>
  );
};
