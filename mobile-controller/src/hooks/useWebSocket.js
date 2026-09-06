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
	const urlRef = useRef(url);
	const onMotionRef = useRef(onMotion);
	const onGameStateRef = useRef(onGameState);
	const onConnectionChangeRef = useRef(onConnectionChange);
	const onErrorRef = useRef(onError);
	const reconnectIntervalRef = useRef(reconnectInterval);
	const maxReconnectAttemptsRef = useRef(maxReconnectAttempts);

	urlRef.current = url;
	onMotionRef.current = onMotion;
	onGameStateRef.current = onGameState;
	onConnectionChangeRef.current = onConnectionChange;
	onErrorRef.current = onError;
	reconnectIntervalRef.current = reconnectInterval;
	maxReconnectAttemptsRef.current = maxReconnectAttempts;

	const handleMessage = useCallback((message) => {
		if (!isMountedRef.current) return;
		setLastMessage(message);
		switch (message.type) {
			case 'motion':
				onMotionRef.current?.(message);
				break;
			case 'game':
				if (onGameStateRef.current && message.state) onGameStateRef.current(message.state);
				break;
			case 'connection':
				console.log('[useWebSocket] Connection status:', message.status);
				break;
			case 'ack':
				console.log('[useWebSocket] ACK received for:', message.original_type);
				break;
			case 'error':
				console.error('[useWebSocket] Server error:', message.message);
				onErrorRef.current?.(message.message);
				break;
			case 'calibrate':
				console.log('[useWebSocket] Calibration requested');
				break;
			default:
				console.log('[useWebSocket] Unknown message type:', message.type);
		}
	}, []);

	const handleStatusChange = useCallback((newStatus) => {
		if (!isMountedRef.current) return;
		setStatus(newStatus);
		onConnectionChangeRef.current?.(newStatus);
	}, []);

	const handleError = useCallback((error) => {
		if (isMountedRef.current) onErrorRef.current?.(error);
	}, []);

	useEffect(() => {
		isMountedRef.current = true;
		const isValidUrl = urlRef.current && urlRef.current !== 'ws://' && !urlRef.current.includes('//:') && urlRef.current.replace('ws://', '').includes(':');
		if (!isValidUrl) {
			setStatus('disconnected');
			return;
		}
		const manager = new ConnectionManager({
			url: urlRef.current,
			onMessage: handleMessage,
			onStatusChange: handleStatusChange,
			onError: handleError,
			reconnectInterval: reconnectIntervalRef.current,
			maxReconnectAttempts: maxReconnectAttemptsRef.current,
		});
		managerRef.current = manager;
		manager.connect();
		return () => {
			isMountedRef.current = false;
			manager.disconnect();
		};
	}, [url, handleMessage, handleStatusChange, handleError]);

	return {
		status,
		sendMotion: useCallback((data) => managerRef.current?.sendMotion(data), []),
		sendCalibrate: useCallback((data) => managerRef.current?.sendCalibrate(data), []),
		sendPing: useCallback(() => managerRef.current?.sendPing(), []),
		sendStatus: useCallback((statusText) => managerRef.current?.sendStatus(statusText), []),
		disconnect: useCallback(() => managerRef.current?.disconnect(), []),
		reconnect: useCallback(() => managerRef.current?.reconnect(), []),
		lastMessage,
	};
}
