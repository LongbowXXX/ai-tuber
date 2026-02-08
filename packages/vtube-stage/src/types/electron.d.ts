export interface IElectronAPI {
  socket: {
    connect: () => void;
    disconnect: () => void;
    send: (message: string | object) => void;
    onOpen: (callback: () => void) => void;
    onClose: (callback: () => void) => void;
    onError: (callback: (error: string) => void) => void;
    onMessage: (callback: (message: string) => void) => void;
  };
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
