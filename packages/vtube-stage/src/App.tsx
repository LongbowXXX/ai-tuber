import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useStageCommandHandler } from './hooks/useStageCommandHandler';
import StagePage from './pages/StagePage';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const { avatars, setAvatars, lastMessage, isConnected, handleTTSComplete } = useStageCommandHandler();

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <StagePage
        avatars={avatars}
        setAvatars={setAvatars}
        lastMessage={lastMessage}
        isConnected={isConnected}
        onTTSComplete={handleTTSComplete}
      />
    </ThemeProvider>
  );
}

export default App;
