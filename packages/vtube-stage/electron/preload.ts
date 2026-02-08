console.log('[Preload] Script execution started');
import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
  socket: {
    connect: () => ipcRenderer.send('socket-connect'),
    disconnect: () => ipcRenderer.send('socket-disconnect'),
    send: (message: string | object) => ipcRenderer.send('socket-send', message),
    onOpen: (callback: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subscription = (_: Electron.IpcRendererEvent) => callback();
      ipcRenderer.on('socket-on-open', subscription);
      return () => ipcRenderer.removeListener('socket-on-open', subscription);
    },
    onClose: (callback: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subscription = (_: Electron.IpcRendererEvent) => callback();
      ipcRenderer.on('socket-on-close', subscription);
      return () => ipcRenderer.removeListener('socket-on-close', subscription);
    },
    onError: (callback: (error: string) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subscription = (_: Electron.IpcRendererEvent, error: string) => callback(error);
      ipcRenderer.on('socket-on-error', subscription);
      return () => ipcRenderer.removeListener('socket-on-error', subscription);
    },
    onMessage: (callback: (message: string) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subscription = (_: Electron.IpcRendererEvent, message: string) => callback(message);
      ipcRenderer.on('socket-on-message', subscription);
      return () => ipcRenderer.removeListener('socket-on-message', subscription);
    },
  },
});
