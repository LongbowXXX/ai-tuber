interface StageCommand {
  command: string;
  payload: Record<string, unknown>;
}

export interface ElectronAPI {
  onStageCommand: (callback: (command: StageCommand) => void) => void;
  sendSpeakEnd: (speakId: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
