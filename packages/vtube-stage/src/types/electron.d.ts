export interface ElectronAPI {
  sendSpeakEnd: (speakId: string) => void;
  onStageCommand: (callback: (command: unknown) => void) => void;
  removeStageCommandListener: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
