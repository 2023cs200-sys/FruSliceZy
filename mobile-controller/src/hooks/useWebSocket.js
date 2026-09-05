import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectionManager } from '../networking/connectionManager';

export function useWebSocket(options) {
	const {
		url,
		onMotion,
		onGameState,
		onConnectionChange,
		onError,
		reconnectInterval = 3000,
		maxReconnectAttempts = 10,
	} = options;
	const [status, setStatus] = useState('disconnected');
	const [lastMessage, setLastMessage] = useState(null);
	const managerRef = useRef(null);
	const isMountedRef = useRef(true);

	const handleMessage = useCallback((message) => {
		if (!isMountedRef.current) return;
		setLastMessage(message);
		switch (message.type) {
			case 'motion':
				onMotion?.(message);
				break;
			case 'game':
				if (onGameState && message.state) onGameState(message.state);
				break;
			case 'connection':
				console.log('[useWebSocket] Connection status:', message.status);
				break;
			case 'ack':
				console.log('[useWebSocket] ACK received for:', message.original_type);
				break;
			case 'error':
				console.error('[useWebSocket] Server error:', message.message);
				onError?.(message.message);
				break;
			case 'calibrate':
				console.log('[useWebSocket] Calibration requested');
				break;
			default:
				console.log('[useWebSocket] Unknown message type:', message.type);
		}
	}, [onMotion, onGameState, onError]);

	const handleStatusChange = useCallback((newStatus) => {
		if (!isMountedRef.current) return;
		setStatus(newStatus);
		onConnectionChange?.(newStatus);
	}, [onConnectionChange]);

	const handleError = useCallback((error) => {
		if (isMountedRef.current) onError?.(error);
	}, [onError]);

	useEffect(() => {
		isMountedRef.current = true;
		const manager = new ConnectionManager({
			url,
			onMessage: handleMessage,
			onStatusChange: handleStatusChange,
			onError: handleError,
			reconnectInterval,
			maxReconnectAttempts,
		});
		managerRef.current = manager;
		manager.connect();
		return () => {
			isMountedRef.current = false;
			manager.disconnect();
		};
	}, [url, handleMessage, handleStatusChange, handleError, reconnectInterval, maxReconnectAttempts]);

	return {
		status,
		sendMotion: useCallback((data) => managerRef.current?.sendMotion(data), []),
		sendCalibrate: useCallback(() => managerRef.current?.sendCalibrate(), []),
		sendPing: useCallback(() => managerRef.current?.sendPing(), []),
		sendStatus: useCallback((statusText) => managerRef.current?.sendStatus(statusText), []),
		disconnect: useCallback(() => managerRef.current?.disconnect(), []),
		reconnect: useCallback(() => managerRef.current?.reconnect(), []),
		lastMessage,
	};
}
