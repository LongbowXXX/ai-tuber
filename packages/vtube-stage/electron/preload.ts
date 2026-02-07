import { contextBridge, ipcRenderer } from 'electron';

type StageApi = {
  onCommand: (handler: (command: unknown) => void) => () => void;
  notifySpeakEnd: (speakId: string) => void;
  notifyReady: () => void;
};

const stageApi: StageApi = {
  onCommand: handler => {
    const listener = (_event: Electron.IpcRendererEvent, command: unknown) => handler(command);
    ipcRenderer.on('stage-command', listener);
    return () => ipcRenderer.removeListener('stage-command', listener);
  },
  notifySpeakEnd: speakId => {
    ipcRenderer.send('speak-end', speakId);
  },
  notifyReady: () => {
    ipcRenderer.send('renderer-ready');
  },
};

contextBridge.exposeInMainWorld('stageApi', stageApi);
