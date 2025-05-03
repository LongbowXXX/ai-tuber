import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { StageCommand } from '../types/command';
import { validateStageCommand } from '../utils/command_validator';

// Define the structure for a single avatar's state (copied from App.tsx)
export interface AvatarState {
  id: string;
  vrmUrl: string;
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string;
  position: [number, number, number];
}

export function useStageCommandHandler() {
  const [lastMessage, setLastMessage] = useState<StageCommand | object | null>(null);
  const [avatars, setAvatars] = useState<AvatarState[]>([
    // Initial avatar states (copied from App.tsx)
    {
      id: 'avatar1',
      vrmUrl: '/avatar.vrm',
      animationUrls: { idle: '/idle.vrma', wave: '/wave.vrma' },
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: 'idle',
      position: [-0.5, 0, 0],
    },
    {
      id: 'avatar2',
      vrmUrl: '/avatar2.vrm',
      animationUrls: { idle: '/idle.vrma', wave: '/wave.vrma' },
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: 'idle',
      position: [0.5, 0, 0],
    },
  ]);

  const handleWebSocketMessage = useCallback(async (data: unknown) => {
    const validationResult = await validateStageCommand(data);

    if (validationResult.errors.length === 0 && validationResult.command) {
      const command = validationResult.command;
      setLastMessage(command);

      switch (command.command) {
        case 'setExpression':
          console.log(
            `Received setExpression: Character=${command.payload.characterId}, Name=${command.payload.expressionName}, Weight=${command.payload.weight}`
          );
          setAvatars(prevAvatars =>
            prevAvatars.map(a =>
              a.id === command.payload.characterId
                ? {
                    ...a,
                    expressionWeights: {
                      ...a.expressionWeights,
                      [command.payload.expressionName]: command.payload.weight,
                    },
                  }
                : a
            )
          );
          break;
        case 'logMessage':
          console.log(`Server log: ${command.payload.message}`);
          break;
        // Add cases for 'playAnimation' and 'setHeadYaw' here later if needed
        default: {
          // Use type assertion after validation ensures command exists
          const unknownCommand = command as StageCommand;
          console.warn(`Received unknown or unhandled command type after validation: ${unknownCommand.command}`);
        }
      }
    } else {
      console.warn('Received data failed validation:', validationResult.errors);
      setLastMessage({ error: 'Validation failed', errors: validationResult.errors, data });
    }
  }, []); // No external dependencies needed within the hook itself for this handler

  const { isConnected, sendMessage } = useWebSocket<unknown>({
    onMessage: handleWebSocketMessage,
  });

  return {
    avatars,
    setAvatars, // Expose setAvatars for direct manipulation if needed (e.g., by VRMController)
    lastMessage,
    isConnected,
    sendMessage,
  };
}
