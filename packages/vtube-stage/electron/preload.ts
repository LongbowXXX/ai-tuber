import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Send speakEnd event to main process
  sendSpeakEnd: (speakId: string) => {
    ipcRenderer.send('speakEnd', speakId);
  },
  
  // Receive stage commands from main process
  onStageCommand: (callback: (command: unknown) => void) => {
    ipcRenderer.on('stage-command', (_event, command) => {
      callback(command);
    });
  },
  
  // Remove listener
  removeStageCommandListener: () => {
    ipcRenderer.removeAllListeners('stage-command');
  },
});
