import { MESSAGE_TYPES } from './messageTypes';

export class ConnectionManager {
	constructor(config) {
		this.ws = null;
		this.reconnectAttempts = 0;
		this.reconnectTimeout = null;
		this.isIntentionalDisconnect = false;
		this.messageQueue = [];
		this.config = {
			url: config.url,
			onMessage: config.onMessage || (() => {}),
			onStatusChange: config.onStatusChange || (() => {}),
			onError: config.onError || (() => {}),
			reconnectInterval: config.reconnectInterval ?? 3000,
			maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
		};
	}

	connect() {
		if (this.ws?.readyState === WebSocket.OPEN) return;

		this.setStatus('connecting');
		this.isIntentionalDisconnect = false;

		try {
			this.ws = new WebSocket(this.config.url);

			this.ws.onopen = () => {
				console.log('[ConnectionManager] Connected to', this.config.url);
				this.reconnectAttempts = 0;
				this.setStatus('connected');
				this.flushMessageQueue();
				this.sendStatus('ready');
			};

			this.ws.onmessage = (event) => {
				try {
					this.config.onMessage(JSON.parse(event.data));
				} catch (error) {
					console.error('[ConnectionManager] Failed to parse message:', error);
				}
			};

			this.ws.onclose = (event) => {
				console.log('[ConnectionManager] Disconnected:', event.code, event.reason);
				this.ws = null;
				if (!this.isIntentionalDisconnect) {
					this.setStatus('disconnected');
					this.scheduleReconnect();
				} else {
					this.setStatus('disconnected');
				}
			};

			this.ws.onerror = (error) => {
				console.error('[ConnectionManager] Error:', error);
				this.setStatus('error');
				this.config.onError('WebSocket connection error');
			};
		} catch (error) {
			console.error('[ConnectionManager] Failed to create connection:', error);
			this.setStatus('error');
			this.config.onError('Failed to create WebSocket connection');
			this.scheduleReconnect();
		}
	}

	scheduleReconnect() {
		if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
			console.log('[ConnectionManager] Max reconnect attempts reached');
			this.config.onError('Max reconnection attempts reached');
			return;
		}

		this.reconnectAttempts += 1;
		const delay = this.config.reconnectInterval * Math.min(this.reconnectAttempts, 5);
		console.log(`[ConnectionManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
		this.reconnectTimeout = setTimeout(() => this.connect(), delay);
	}

	setStatus(status) {
		this.config.onStatusChange(status);
	}

	flushMessageQueue() {
		while (this.messageQueue.length > 0) {
			this.sendRaw(this.messageQueue.shift());
		}
	}

	sendRaw(message) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		} else {
			this.messageQueue.push(message);
		}
	}

	send(message) {
		this.sendRaw(message);
	}

	sendMotion(data) {
		this.send({
			type: MESSAGE_TYPES.MOTION,
			timestamp: data.timestamp || Date.now(),
			accelerometer: data.accelerometer,
			gyroscope: data.gyroscope,
		});
	}

	sendCalibrate() {
		this.send({ type: MESSAGE_TYPES.CALIBRATE });
	}

	sendPing() {
		this.send({ type: MESSAGE_TYPES.PING });
	}

	sendStatus(status) {
		this.send({ type: MESSAGE_TYPES.STATUS, status });
	}

	disconnect() {
		this.isIntentionalDisconnect = true;
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
		if (this.ws) {
			this.ws.close(1000, 'Intentional disconnect');
			this.ws = null;
		}
		this.setStatus('disconnected');
	}

	reconnect() {
		this.disconnect();
		this.isIntentionalDisconnect = false;
		this.reconnectAttempts = 0;
		setTimeout(() => this.connect(), 100);
	}

	getStatus() {
		if (!this.ws) return 'disconnected';
		switch (this.ws.readyState) {
			case WebSocket.CONNECTING:
				return 'connecting';
			case WebSocket.OPEN:
				return 'connected';
			default:
				return 'disconnected';
		}
	}

	isConnected() {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}
