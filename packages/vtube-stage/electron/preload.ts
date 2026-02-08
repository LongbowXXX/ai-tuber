console.log('[Preload] Script execution started');
import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
  socket: {
    connect: () => ipcRenderer.send('socket-connect'),
    disconnect: () => ipcRenderer.send('socket-disconnect'),
    send: (message: string | object) => ipcRenderer.send('socket-send', message),
    onOpen: (callback: () => void) => ipcRenderer.on('socket-on-open', () => callback()),
    onClose: (callback: () => void) => ipcRenderer.on('socket-on-close', () => callback()),
    onError: (callback: (error: string) => void) =>
      ipcRenderer.on('socket-on-error', (_event, error) => callback(error)),
    onMessage: (callback: (message: string) => void) =>
      ipcRenderer.on('socket-on-message', (_event, message) => callback(message)),
  },
});
