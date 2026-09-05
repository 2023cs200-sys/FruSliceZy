import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(options) {
  const {
    url,
    role,
    onMotion,
    onGameState,
    onConnectionChange,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    autoConnect = true,
  } = options;

  const [status, setStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);

  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const isIntentionalDisconnectRef = useRef(false);
  const messageQueueRef = useRef([]);

  const updateStatus = useCallback((newStatus) => {
    setStatus(newStatus);
    onConnectionChange?.(newStatus);
  }, [onConnectionChange]);

  const processMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessage(data);

      switch (data.type) {
        case 'motion':
          if (onMotion && data.accelerometer && data.gyroscope) {
            onMotion({
              timestamp: data.timestamp,
              accelerometer: data.accelerometer,
              gyroscope: data.gyroscope,
            });
          }
          break;

        case 'game':
        case 'game_state':
          if (onGameState && data.state) {
            onGameState(data.state);
          }
          break;

        case 'connection':
          console.log('[WebSocket] Connection status:', data.status);
          break;

        case 'ack':
          console.log('[WebSocket] ACK received for:', data.original_type);
          break;

        case 'error':
          console.error('[WebSocket] Server error:', data.message);
          onError?.(data.message);
          break;

        case 'calibrate':
          console.log('[WebSocket] Calibration requested');
          break;

        default:
          console.log('[WebSocket] Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('[WebSocket] Failed to parse message:', err);
    }
  }, [onMotion, onGameState, onError]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateStatus('connecting');
    isIntentionalDisconnectRef.current = false;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to', url);
        reconnectAttemptsRef.current = 0;
        updateStatus('connected');

        ws.send(JSON.stringify({ type: 'status', status: 'ready' }));
      };

      ws.onmessage = processMessage;

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        wsRef.current = null;

        if (!isIntentionalDisconnectRef.current) {
          updateStatus('disconnected');
          scheduleReconnect();
        } else {
          updateStatus('disconnected');
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        updateStatus('error');
        onError?.('WebSocket connection error');
      };
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err);
      updateStatus('error');
      onError?.('Failed to create WebSocket connection');
      scheduleReconnect();
    }
  }, [url, updateStatus, processMessage, onError]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      onError?.('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = reconnectInterval * Math.min(reconnectAttemptsRef.current, 5);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, maxReconnectAttempts, reconnectInterval, onError]);

  const send = useCallback((message) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      messageQueueRef.current.push(message);
    }
  }, []);

  const sendMotion = useCallback((data) => {
    send({
      type: 'motion',
      timestamp: data.timestamp || Date.now(),
      accelerometer: data.accelerometer,
      gyroscope: data.gyroscope,
    });
  }, [send]);

  const sendGameState = useCallback((state) => {
    send({
      type: 'game',
      state,
    });
  }, [send]);

  const sendCalibrate = useCallback(() => {
    send({ type: 'calibrate' });
  }, [send]);

  const sendPing = useCallback(() => {
    send({ type: 'ping' });
  }, [send]);

  const sendStatus = useCallback((statusText) => {
    send({ type: 'status', status: statusText });
  }, [send]);

  const disconnect = useCallback(() => {
    isIntentionalDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const ws = wsRef.current;
    if (ws) {
      ws.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }

    updateStatus('disconnected');
  }, [updateStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    isIntentionalDisconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  useEffect(() => {
    if (!autoConnect) return undefined;

    connect();

    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    send,
    sendMotion,
    sendGameState,
    sendCalibrate,
    sendPing,
    sendStatus,
    disconnect,
    reconnect,
    lastMessage,
  };
}