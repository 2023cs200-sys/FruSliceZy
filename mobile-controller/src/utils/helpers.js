import { MOTION_THRESHOLD } from './constants';

export function calculateMagnitude(x, y, z) {
	return Math.sqrt((x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2);
}

export function calculateMovingAverage(buffer, newValue, windowSize) {
	buffer.push(newValue);
	if (buffer.length > windowSize) {
		buffer.shift();
	}
	if (buffer.length === 0) return 0;
	const sum = buffer.reduce((acc, val) => acc + val, 0);
	return sum / buffer.length;
}

export function clamp(value, min, max) {
	if (value === null || value === undefined || Number.isNaN(value)) return min;
	return Math.min(Math.max(value, min), max);
}

export function formatSensorValue(value) {
	if (value === null || value === undefined || Number.isNaN(value)) return '0.00';
	return value.toFixed(2);
}

export function isMotionDetected(magnitude, threshold = MOTION_THRESHOLD) {
	return magnitude > threshold;
}

export function determineDirection(accelX, accelY) {
	const absX = Math.abs(accelX);
	const absY = Math.abs(accelY);
	const total = absX + absY;
	if (total < 0.1) return 'NONE';
	const angle = Math.atan2(accelY, accelX) * (180 / Math.PI);
	if (angle >= -22.5 && angle < 22.5) return 'RIGHT';
	if (angle >= 22.5 && angle < 67.5) return 'DOWN';
	if (angle >= 67.5 || angle < -67.5) return 'UP';
	if (angle >= -67.5 && angle < -22.5) return 'LEFT';
	return 'DIAGONAL';
}

export function createBuffer(size) {
	return { buffer: [], size };
}

export function pushToBuffer(bufferObj, value) {
	const { buffer, size } = bufferObj;
	buffer.push(value);
	if (buffer.length > size) buffer.shift();
	return buffer;
}

export function getBufferAverage(bufferObj) {
	const { buffer } = bufferObj;
	if (buffer.length === 0) return 0;
	return buffer.reduce((acc, val) => acc + val, 0) / buffer.length;
}
