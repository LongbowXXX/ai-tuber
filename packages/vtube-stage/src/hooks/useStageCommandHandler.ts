import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { StageCommand, AvatarState as BaseAvatarState } from '../types/command';
import { validateStageCommand } from '../utils/command_validator';

// Define an internal state that extends the base AvatarState with position and speaking message
export interface InternalAvatarState extends BaseAvatarState {
  position: [number, number, number];
  speakingMessage?: string; // Add optional speakingMessage property
}

export function useStageCommandHandler() {
  const [lastMessage, setLastMessage] = useState<StageCommand | object | null>(null);
  const [avatars, setAvatars] = useState<InternalAvatarState[]>([
    // Initial avatar states
    {
      id: 'avatar1',
      vrmUrl: '/avatar/avatar.vrm',
      animationUrls: {
        idle: '/vrma/idle04.vrma',
        wave: '/vrma/wave01.vrma',
        airplane: '/vrma/airplane02.vrma',
        rotate_left: '/vrma/rotate_left1.vrma',
        rotate_right: '/vrma/rotate_right.vrma',
        smallwave: '/vrma/smallwve.vrma',
        akimbo: '/vrma/stand01.vrma',
      },
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: 'idle',
      position: [-0.5, 0, 0],
    },
    {
      id: 'avatar2',
      vrmUrl: '/avatar/avatar2.vrm',
      animationUrls: {
        idle: '/vrma/idle04.vrma',
        wave: '/vrma/wave01.vrma',
        airplane: '/vrma/airplane02.vrma',
        rotate_left: '/vrma/rotate_left1.vrma',
        rotate_right: '/vrma/rotate_right.vrma',
        smallwave: '/vrma/smallwve.vrma',
        akimbo: '/vrma/stand01.vrma',
      },
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
        case 'logMessage':
          console.log(`Server log: ${command.payload.message}`);
          break;
        case 'speak':
          console.log(`Received speak: Character=${command.payload.characterId}, Message=${command.payload.message}`);
          setAvatars(prevAvatars =>
            prevAvatars.map(a => {
              if (a.id === command.payload.characterId) {
                // Create a new expressionWeights object with all weights set to 0
                const newExpressionWeights: { [key: string]: number } = {};
                Object.keys(a.expressionWeights).forEach(key => {
                  newExpressionWeights[key] = 0;
                });

                // Set the specified expression's weight
                newExpressionWeights[command.payload.emotion] = 1.0;
                return {
                  ...a,
                  speechText: command.payload.message,
                  expressionWeights: newExpressionWeights,
                };
              }
              // Optionally clear message for other avatars or handle concurrent speech
              // For now, just return the avatar as is if it's not the target
              return a;
            })
          );
          // TODO: Implement clearing the message after a delay or based on other events
          break;
        // Add cases for 'playAnimation' and 'setHeadYaw' here later if needed
        default: {
          const unknownCommand = command as StageCommand;
          console.warn(`Received unknown or unhandled command type after validation: ${unknownCommand.command}`);
        }
      }
    } else {
      console.warn('Received data failed validation:', validationResult.errors);
      setLastMessage({ error: 'Validation failed', errors: validationResult.errors, data });
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket<unknown>({
    onMessage: handleWebSocketMessage,
  });

  return {
    avatars,
    setAvatars,
    lastMessage,
    isConnected,
    sendMessage,
  };
}
