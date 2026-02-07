import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  onStageCommand: (callback: (command: any) => void) => {
    ipcRenderer.on('stage-command', (_event, command) => {
      callback(command);
    });
  },
  sendSpeakEnd: (speakId: string) => {
    ipcRenderer.send('speakEnd', speakId);
  },
});
