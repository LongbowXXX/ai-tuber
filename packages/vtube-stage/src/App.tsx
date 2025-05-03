import { Canvas } from '@react-three/fiber';
import { VRMController } from './components/VRMController';
import { SceneContent } from './components/SceneContent';
import { ThemeProvider, createTheme, CssBaseline, Box, Paper, Typography, Chip, Button } from '@mui/material';
import { useStageCommandHandler } from './hooks/useStageCommandHandler';

// Define the light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  // Use the new hook to manage state and WebSocket connection
  const { avatars, setAvatars, lastMessage, isConnected, sendMessage } = useStageCommandHandler();

  const sendTestMessage = () => {
    const message = `Test message from client at ${new Date().toLocaleTimeString()}`;
    sendMessage(message); // Use sendMessage from the hook
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Canvas Area */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {/* Pass avatars state from the hook */}
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

          {/* Connection Status - Use isConnected from the hook */}
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

          {/* Last Received Message - Use lastMessage from the hook */}
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

          {/* Test Button - Use isConnected and sendTestMessage */}
          <Button variant="contained" onClick={sendTestMessage} disabled={!isConnected}>
            Send Test Message
          </Button>

          {/* VRM Controllers - Use avatars and setAvatars from the hook */}
          {avatars.map(avatar => (
            <VRMController
              key={avatar.id}
              title={`Avatar ${avatar.id.replace('avatar', '')} Controls`}
              onExpressionChange={(name, weight) => {
                // Use setAvatars from the hook
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
                // Use setAvatars from the hook
                setAvatars(prevAvatars => prevAvatars.map(a => (a.id === avatar.id ? { ...a, headYaw: angle } : a)));
              }}
              onAnimationChange={animationName => {
                // Use setAvatars from the hook
                setAvatars(prevAvatars =>
                  prevAvatars.map(a => (a.id === avatar.id ? { ...a, currentAnimationName: animationName } : a))
                );
              }}
              availableAnimations={Object.keys(avatar.animationUrls)}
            />
          ))}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;
