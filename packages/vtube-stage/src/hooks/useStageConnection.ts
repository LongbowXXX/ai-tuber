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
    // 接続開始 (内部的に Electron IPC / WebSocket を使用)
    window.electron.socket.connect();

    window.electron.socket.onOpen(() => {
      console.log('Stage Connection Established');
      setIsConnected(true);
      onOpen?.();
    });

    window.electron.socket.onClose(() => {
      console.log('Stage Connection Closed');
      setIsConnected(false);
      onClose?.();
    });

    window.electron.socket.onError(error => {
      console.error('Stage Connection Error:', error);
      onError?.(error);
    });

    window.electron.socket.onMessage(data => {
      onRawMessage?.(data);
      try {
        const parsedData = JSON.parse(data);
        onMessage(parsedData);
      } catch (error) {
        console.error('Failed to parse stage message:', error);
      }
    });

    // Clean up function
    return () => {
      // リスナーの解除が必要だが、現状の preload 実装では removeListener を返していない。
      // ただし、useEffect のクリーンアップで disconnect を呼ぶ設計であれば、
      // サーバー切断 -> イベント発火 -> ステート更新 -> アンマウント というフローになる。
      // 本来は IPC リスナーの削除もすべきだが、簡易実装として disconnect を呼ぶ。

      console.log('Disconnecting stage connection on unmount');
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
