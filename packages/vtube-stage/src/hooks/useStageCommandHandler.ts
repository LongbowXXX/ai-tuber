import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { StageCommand, AvatarState as BaseAvatarState } from '../types/command';
import { validateStageCommand } from '../utils/command_validator';

// Define an internal state that extends the base AvatarState with position and speaking message
export interface InternalAvatarState extends BaseAvatarState {
  position: [number, number, number];
}

export function useStageCommandHandler() {
  const [lastMessage, setLastMessage] = useState<StageCommand | object | null>(null);
  const [avatars, setAvatars] = useState<InternalAvatarState[]>([]); // 初期値を空配列に

  useEffect(() => {
    fetch('/avatars.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch avatars.json');
        return res.json();
      })
      .then(data => {
        setAvatars(data);
      })
      .catch(err => {
        console.error('Error loading avatars.json:', err);
      });
  }, []);

  const handleWebSocketMessage = useCallback(async (data: unknown) => {
    const validationResult = await validateStageCommand(data);

    if (validationResult.errors.length === 0 && validationResult.command) {
      const command = validationResult.command;
      setLastMessage(command);

      switch (command.command) {
        case 'logMessage':
          console.log(`Server log: ${command.payload.message}`);
          break;
        case 'speak': {
          const { characterId, message, caption, emotion, speakId } = command.payload;
          console.log(`Received speak: Character=${characterId}, SpeakId=${speakId}, Message=${message}`);
          setAvatars(prevAvatars =>
            prevAvatars.map(a => {
              if (a.id === characterId) {
                const lipsyncMouthList = ['aa', 'ih', 'ou', 'ee', 'oh'];
                const newExpressionWeights: { [key: string]: number } = { ...a.expressionWeights };
                // emotionで指定された表情のみ1.0、それ以外は0。ただし口パク用は除外
                Object.keys(newExpressionWeights).forEach(key => {
                  if (!lipsyncMouthList.includes(key)) {
                    newExpressionWeights[key] = 0;
                  }
                });
                newExpressionWeights[emotion] = 1.0; // 指定された表情を1.0に
                return {
                  ...a,
                  speechText: { id: speakId, text: message, caption: caption },
                  expressionWeights: newExpressionWeights,
                };
              }
              return a;
            })
          );
          break;
        }
        case 'triggerAnimation':
          console.log(
            `Received triggerAnimation: Character=${command.payload.characterId}, Animation=${command.payload.animationName}`
          );
          setAvatars(prevAvatars =>
            prevAvatars.map(a => {
              if (a.id === command.payload.characterId) {
                return {
                  ...a,
                  currentAnimationName: command.payload.animationName,
                };
              }
              return a;
            })
          );
          break;
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

  // TTS完了時のハンドラ
  const handleTTSComplete = useCallback(
    (avatarId: string, speakId: string) => {
      console.log(`TTS complete for Avatar: ${avatarId}, SpeakId: ${speakId}`);
      setAvatars(prevAvatars =>
        prevAvatars.map(a => {
          if (a.id === avatarId) {
            const lipsyncMouthList = ['aa', 'ih', 'ou', 'ee', 'oh'];
            const newExpressionWeights: { [key: string]: number } = { ...a.expressionWeights };
            // 口パク用は除外
            Object.keys(newExpressionWeights).forEach(key => {
              if (!lipsyncMouthList.includes(key)) {
                newExpressionWeights[key] = 0;
              }
            });
            newExpressionWeights['neutral'] = 1.0;

            return {
              ...a,
              expressionWeights: newExpressionWeights,
            };
          }
          return a;
        })
      );
      if (sendMessage && speakId) {
        sendMessage({
          command: 'speakEnd',
          payload: { speakId },
        });
      }
    },
    [sendMessage]
  );

  // アニメーション終了時のハンドラ
  const handleAnimationEnd = useCallback((avatarId: string, animationName: string) => {
    console.log(`Animation ended for Avatar: ${avatarId}, Animation: ${animationName}`);
    setAvatars(prevAvatars =>
      prevAvatars.map(a => {
        if (a.id === avatarId) {
          return {
            ...a,
            currentAnimationName: null, // アニメーション名をリセット
          };
        }
        return a;
      })
    );
  }, []);

  return {
    avatars,
    setAvatars,
    lastMessage,
    isConnected,
    handleTTSComplete,
    handleAnimationEnd, // 追加
  };
}
