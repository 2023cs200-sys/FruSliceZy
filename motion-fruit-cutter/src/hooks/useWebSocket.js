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
  const [currentUrl, setCurrentUrl] = useState(url);

  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const isIntentionalDisconnectRef = useRef(false);
  const messageQueueRef = useRef([]);
  const urlRef = useRef(url);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const onErrorRef = useRef(onError);
  const onMotionRef = useRef(onMotion);
  const onGameStateRef = useRef(onGameState);

  urlRef.current = url;
  onConnectionChangeRef.current = onConnectionChange;
  onErrorRef.current = onError;
  onMotionRef.current = onMotion;
  onGameStateRef.current = onGameState;

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const updateStatus = useCallback((newStatus) => {
    setStatus(newStatus);
    onConnectionChangeRef.current?.(newStatus);
  }, []);

  const processMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessage(data);

      switch (data.type) {
        case 'motion':
          if (onMotionRef.current && data.accelerometer && data.gyroscope) {
            onMotionRef.current({
              timestamp: data.timestamp,
              accelerometer: data.accelerometer,
              gyroscope: data.gyroscope,
              sword_position: data.sword_position,
              sword_rotation: data.sword_rotation,
              motion_magnitude: data.motion_magnitude,
              is_slashing: data.is_slashing,
              slash_direction: data.slash_direction,
              calibrated: data.calibrated,
            });
          }
          break;

        case 'game':
        case 'game_state':
          if (onGameStateRef.current && data.state) {
            onGameStateRef.current(data.state);
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
          onErrorRef.current?.(data.message);
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
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateStatus('connecting');
    isIntentionalDisconnectRef.current = false;

    try {
      const ws = new WebSocket(urlRef.current);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to', urlRef.current);
        reconnectAttemptsRef.current = 0;
        updateStatus('connected');

        ws.send(JSON.stringify({ type: 'status', status: 'ready', role }));
      };

      ws.onmessage = processMessage;

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        wsRef.current = null;

        if (!isIntentionalDisconnectRef.current) {
          updateStatus('disconnected');
          scheduleReconnectRef.current();
        } else {
          updateStatus('disconnected');
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        updateStatus('error');
        onErrorRef.current?.('WebSocket connection error');
      };
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err);
      updateStatus('error');
      onErrorRef.current?.('Failed to create WebSocket connection');
      scheduleReconnectRef.current();
    }
  }, [updateStatus, processMessage]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      onErrorRef.current?.('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = reconnectInterval * Math.min(reconnectAttemptsRef.current, 5);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, maxReconnectAttempts, reconnectInterval]);

  const scheduleReconnectRef = useRef(scheduleReconnect);
  scheduleReconnectRef.current = scheduleReconnect;

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

  const sendTuning = useCallback((config) => {
    send({ type: 'tuning', config });
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

  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);
  connectRef.current = connect;
  disconnectRef.current = disconnect;

  useEffect(() => {
    let cancelled = false;
    if (autoConnect) {
      connectRef.current();
    }
    return () => {
      cancelled = true;
      disconnectRef.current();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [autoConnect, currentUrl]);

  return {
    status,
    send,
    sendMotion,
    sendGameState,
    sendCalibrate,
    sendTuning,
    sendPing,
    sendStatus,
    disconnect,
    reconnect,
    lastMessage,
  };
}