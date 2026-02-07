import { contextBridge, ipcRenderer } from 'electron';

interface StageCommand {
  command: string;
  payload: Record<string, unknown>;
}

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  onStageCommand: (callback: (command: StageCommand) => void) => {
    ipcRenderer.on('stage-command', (_event, command: StageCommand) => {
      callback(command);
    });
  },
  sendSpeakEnd: (speakId: string) => {
    ipcRenderer.send('speakEnd', speakId);
  },
});
