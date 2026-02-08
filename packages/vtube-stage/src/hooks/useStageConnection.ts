import { useState, useEffect, useCallback } from 'react';

/**
 * サーバー接続のオプション
 */
interface UseStageConnectionOptions<T> {
  onMessage: (message: T) => void;
  onRawMessage?: (data: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

/**
 * ステージサーバーとの接続を管理するフック
 * 通信プロトコル(WebSocket等)の実装詳細は隠蔽する
 */
export function useStageConnection<T>(options: UseStageConnectionOptions<T>) {
  const { onMessage, onRawMessage, onError, onClose, onOpen } = options;
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Setup listeners first to avoid missing events
    const unsubOpen = window.electron.socket.onOpen(() => {
      console.log('Stage Connection Established');
      setIsConnected(true);
      onOpen?.();
    });

    const unsubClose = window.electron.socket.onClose(() => {
      console.log('Stage Connection Closed');
      setIsConnected(false);
      onClose?.();
    });

    const unsubError = window.electron.socket.onError(error => {
      console.error('Stage Connection Error:', error);
      onError?.(error);
    });

    const unsubMessage = window.electron.socket.onMessage(data => {
      onRawMessage?.(data);
      try {
        const parsedData = JSON.parse(data);
        onMessage(parsedData);
      } catch (error) {
        console.error('Failed to parse stage message:', error);
      }
    });

    // 2. Connect after listeners are ready
    window.electron.socket.connect();

    // Clean up function
    return () => {
      console.log('Cleaning up stage connection listeners and disconnecting on unmount');
      // Unsubscribe from all listeners
      unsubOpen();
      unsubClose();
      unsubError();
      unsubMessage();

      // Disconnect
      window.electron.socket.disconnect();
    };
  }, [onMessage, onRawMessage, onError, onClose, onOpen]);

  const sendMessage = useCallback(
    (message: string | object) => {
      if (isConnected) {
        window.electron.socket.send(message);
      } else {
        console.warn('Stage connection is not ready. Cannot send message.');
      }
    },
    [isConnected]
  );

  return { isConnected, sendMessage };
}
