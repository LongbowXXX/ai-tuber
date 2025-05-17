import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useStageCommandHandler } from './hooks/useStageCommandHandler';
import StagePage from './pages/StagePage';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const { avatars, setAvatars, lastMessage, isConnected, handleTTSComplete, handleAnimationEnd } =
    useStageCommandHandler();

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <StagePage
        avatars={avatars}
        setAvatars={setAvatars}
        lastMessage={lastMessage}
        isConnected={isConnected}
        onTTSComplete={handleTTSComplete}
        onAnimationEnd={handleAnimationEnd}
      />
    </ThemeProvider>
  );
}

export default App;
