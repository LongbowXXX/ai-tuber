import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useStageCommandHandler } from './hooks/useStageCommandHandler';
import StagePage from './pages/StagePage';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const { avatars, setAvatars, lastMessage, isConnected, sendMessage } = useStageCommandHandler();

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <StagePage
        avatars={avatars}
        setAvatars={setAvatars}
        lastMessage={lastMessage}
        isConnected={isConnected}
        sendMessage={sendMessage}
      />
    </ThemeProvider>
  );
}

export default App;
