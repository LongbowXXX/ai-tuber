export interface ElectronAPI {
  onStageCommand: (callback: (command: any) => void) => void;
  sendSpeakEnd: (speakId: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
