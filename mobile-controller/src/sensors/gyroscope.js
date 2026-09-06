import { Gyroscope } from 'expo-sensors';
import { FILTER_WINDOW_SIZE, SENSOR_UPDATE_INTERVAL_MS } from '../utils/constants';
import { clamp, createBuffer } from '../utils/helpers';

export function createGyroscope() {
	let xBuffer = createBuffer(FILTER_WINDOW_SIZE);
	let yBuffer = createBuffer(FILTER_WINDOW_SIZE);
	let zBuffer = createBuffer(FILTER_WINDOW_SIZE);
	let subscription = null;
	let isRunning = false;
	let onUpdate = null;
	let onError = null;

	function getFilteredValue(buffer, newValue) {
		const clamped = clamp(newValue, -20, 20);
		buffer.buffer.push(clamped);
		if (buffer.buffer.length > buffer.size) buffer.buffer.shift();
		if (buffer.buffer.length === 0) return 0;
		const sum = buffer.buffer.reduce((acc, val) => acc + val, 0);
		return sum / buffer.buffer.length;
	}

	function handleUpdate(data) {
		if (!isRunning) return;
		const x = getFilteredValue(xBuffer, data.x ?? 0);
		const y = getFilteredValue(yBuffer, data.y ?? 0);
		const z = getFilteredValue(zBuffer, data.z ?? 0);
		if (onUpdate) {
			onUpdate({ x, y, z, raw: { x: data.x ?? 0, y: data.y ?? 0, z: data.z ?? 0 } });
		}
	}

	function start(updateCallback, errorCallback) {
		if (isRunning) return;
		isRunning = true;
		onUpdate = updateCallback;
		onError = errorCallback;
		try {
			Gyroscope.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
			subscription = Gyroscope.addListener(handleUpdate);
		} catch (error) {
			console.error('[Gyroscope] Failed to start:', error);
			if (onError) onError(error);
			isRunning = false;
		}
	}

	function stop() {
		if (subscription) {
			subscription.remove();
			subscription = null;
		}
		isRunning = false;
		onUpdate = null;
		onError = null;
		xBuffer = createBuffer(FILTER_WINDOW_SIZE);
		yBuffer = createBuffer(FILTER_WINDOW_SIZE);
		zBuffer = createBuffer(FILTER_WINDOW_SIZE);
	}

	function getFilteredData() {
		return {
			x: xBuffer.buffer.length > 0 ? getFilteredValue(xBuffer, 0) : 0,
			y: yBuffer.buffer.length > 0 ? getFilteredValue(yBuffer, 0) : 0,
			z: zBuffer.buffer.length > 0 ? getFilteredValue(zBuffer, 0) : 0,
		};
	}

	function reset() {
		xBuffer = createBuffer(FILTER_WINDOW_SIZE);
		yBuffer = createBuffer(FILTER_WINDOW_SIZE);
		zBuffer = createBuffer(FILTER_WINDOW_SIZE);
	}

	return { start, stop, isRunning: () => isRunning, getFilteredData, reset };
}
