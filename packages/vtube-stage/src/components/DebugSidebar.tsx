import React from 'react';
import { Typography, Chip } from '@mui/material';
import styled from 'styled-components';
import { VRMController } from './VRMController';
import { AvatarState } from '../types/avatar_types';

interface DebugSidebarProps {
  avatars: AvatarState[];
  setAvatars: React.Dispatch<React.SetStateAction<AvatarState[]>>;
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

export const DebugSidebar: React.FC<DebugSidebarProps> = ({ avatars, setAvatars, lastMessage, isConnected }) => {
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
