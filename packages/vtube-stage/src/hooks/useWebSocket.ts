import { useState, useEffect, useCallback } from 'react';

interface UseWebSocketOptions<T> {
  onMessage: (message: T) => void;
  onRawMessage?: (data: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export function useWebSocket<T>(options: UseWebSocketOptions<T>) {
  const { onMessage, onRawMessage, onError, onClose, onOpen } = options;
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 接続開始
    window.electron.socket.connect();

    // イベントリスナーの登録
    window.electron.socket.onOpen(() => {
      console.log('WebSocket Connected via Electron');
      setIsConnected(true);
      onOpen?.();
    });

    window.electron.socket.onClose(() => {
      console.log('WebSocket Disconnected via Electron');
      setIsConnected(false);
      onClose?.();
    });

    window.electron.socket.onError(error => {
      console.error('WebSocket Error via Electron:', error);
      onError?.(error);
    });

    window.electron.socket.onMessage(data => {
      // console.log('Raw message from server:', data);
      onRawMessage?.(data);

      try {
        const parsedData = JSON.parse(data);
        onMessage(parsedData);
      } catch (error) {
        console.error('Failed to parse message JSON:', error);
      }
    });

    // クリーンアップ
    return () => {
      console.log('Closing WebSocket connection via Electron on unmount (or keeping it alive based on design)');
      // コンポーネントのアンマウント時に切断するかどうかは要件次第だが、
      // 通常 Electron アプリではバックグラウンドで維持したい場合もある。
      // 今回は既存実装に合わせて切断する挙動にする。
      window.electron.socket.disconnect();
    };
  }, [onMessage, onRawMessage, onError, onClose, onOpen]);

  const sendMessage = useCallback(
    (message: string | object) => {
      if (isConnected) {
        window.electron.socket.send(message);
        // console.log('Sent message via Electron:', message);
      } else {
        console.warn('WebSocket is not connected. Cannot send message via Electron.');
      }
    },
    [isConnected]
  );

  return { isConnected, sendMessage };
}
