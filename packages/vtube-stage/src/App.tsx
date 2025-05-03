import { Canvas } from '@react-three/fiber';
import { useCallback, useState } from 'react';
import { VRMController } from './components/VRMController';
import { SceneContent } from './components/SceneContent';
import { StageCommand } from './types/command';
import { validateStageCommand } from './utils/command_validator';
import { ThemeProvider, createTheme, CssBaseline, Box, Paper, Typography, Chip, Button } from '@mui/material';
import { useWebSocket } from './hooks/useWebSocket';

// Define the structure for a single avatar's state
interface AvatarState {
  id: string;
  vrmUrl: string;
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string;
  position: [number, number, number];
}

// Define the light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [lastMessage, setLastMessage] = useState<StageCommand | object | null>(null);
  const [avatars, setAvatars] = useState<AvatarState[]>([
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
      const command = validationResult.command; // command is defined here
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
        default: // Check if command exists before accessing command.command
        {
          const commandType = 'command' in command ? command.command : 'unknown';
          console.warn(`Received unknown or unhandled command type after validation: ${commandType}`);
        }
      }
    } else {
      console.warn('Received data failed validation:', validationResult.errors);
      setLastMessage({ error: 'Validation failed', errors: validationResult.errors, data });
    }
  }, []); // Dependencies are correct

  const { isConnected, sendMessage } = useWebSocket<unknown>({
    onMessage: handleWebSocketMessage,
  });

  const sendTestMessage = () => {
    const message = `Test message from client at ${new Date().toLocaleTimeString()}`;
    sendMessage(message);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Canvas Area */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <Canvas camera={{ position: [0, 1.2, 2.5], fov: 50 }} shadows>
            <SceneContent avatars={avatars} />
          </Canvas>
        </Box>
        {/* Controller/Sidebar Area */}
        <Paper
          elevation={3}
          sx={{
            width: '350px',
            padding: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6" component="h3">
            Stage Controls & Status
          </Typography>

          {/* Connection Status */}
          <Box>
            <Typography component="span" variant="body1" sx={{ fontWeight: 'bold' }}>
              Connection Status:{' '}
            </Typography>
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
          </Box>

          {/* Last Received Message */}
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Last Command from Server:
            </Typography>
            <Paper variant="outlined" sx={{ p: 1, maxHeight: '150px', overflowY: 'auto', bgcolor: 'grey.100' }}>
              <Typography component="pre" sx={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                {lastMessage ? JSON.stringify(lastMessage, null, 2) : 'N/A'}
              </Typography>
            </Paper>
          </Box>

          {/* Test Button */}
          <Button variant="contained" onClick={sendTestMessage} disabled={!isConnected}>
            Send Test Message
          </Button>

          {/* VRM Controllers - Corrected props and structure */}
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
        </Paper>{' '}
        {/* Closing Paper tag */}
      </Box>{' '}
      {/* Closing Box tag */}
    </ThemeProvider> /* Closing ThemeProvider tag */
  );
}

export default App;
