export type StageBridge = {
  onCommand: (handler: (command: unknown) => void) => () => void;
  notifySpeakEnd: (speakId: string) => void;
  notifyReady: () => void;
};

declare global {
  interface Window {
    stageApi?: StageBridge;
  }
}
