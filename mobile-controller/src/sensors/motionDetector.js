import { createAccelerometer } from './accelerometer';
import { createGyroscope } from './gyroscope';
import { createCalibrator } from './calibration';
import { calculateMagnitude } from '../utils/helpers';
import { MOTION_THRESHOLD, SLASH_DURATION_MS, SLASH_COOLDOWN_MS, DIRECTION_NONE, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_DOWN } from '../utils/constants';

export function createMotionDetector(config = {}) {
	const threshold = config.threshold ?? MOTION_THRESHOLD;
	const slashDuration = config.slashDuration ?? SLASH_DURATION_MS;
	const cooldown = config.cooldown ?? SLASH_COOLDOWN_MS;

	let accelerometer = null;
	let gyroscope = null;
	let calibrator = null;

	let onSlashCallback = null;
	let onMotionChangeCallback = null;

	let isRunning = false;
	let isCalibrated = false;
	let lastSlashTime = 0;
	let magnitudeBuffer = [];
	let currentDirection = DIRECTION_NONE;
	let currentMagnitude = 0;

	function init() {
		accelerometer = createAccelerometer();
		gyroscope = createGyroscope();
		calibrator = createCalibrator();
	}

	function handleAccelUpdate(filteredData) {
		if (!isRunning) return;

		if (calibrator && calibrator.isCollecting && !isCalibrated) {
			const gyroData = gyroscope.getFilteredData();
			calibrator.collectSample(filteredData, gyroData || { x: 0, y: 0, z: 0 });
		}

		let calibratedAccel = filteredData;
		if (isCalibrated && calibrator) {
			calibratedAccel = calibrator.applyOffset(filteredData);
		}

		let calibratedGyro = gyroscope.getFilteredData();
		if (isCalibrated && calibrator) {
			calibratedGyro = calibrator.applyGyroOffset(calibratedGyro);
		}

		const magnitude = calculateMagnitude(calibratedAccel.x, calibratedAccel.y, calibratedAccel.z);
		currentMagnitude = magnitude;

		magnitudeBuffer.push(magnitude);
		if (magnitudeBuffer.length > 10) magnitudeBuffer.shift();

		const avgMagnitude = magnitudeBuffer.reduce((a, b) => a + b, 0) / magnitudeBuffer.length;

		if (onMotionChangeCallback) {
			onMotionChangeCallback({
				magnitude: avgMagnitude,
				accelerometer: calibratedAccel,
				gyroscope: calibratedGyro,
				direction: currentDirection,
			});
		}

		detectSlash(calibratedAccel, avgMagnitude);
	}

	function detectSlash(accelData, magnitude) {
		const now = Date.now();
		if (now - lastSlashTime < cooldown) return;
		if (!isCalibrated) return;

		if (magnitude > threshold) {
			const start = now;
			const checkInterval = setInterval(() => {
				const elapsed = Date.now() - start;
				if (elapsed >= slashDuration) {
					clearInterval(checkInterval);
					const direction = calculateDirection(accelData);
					currentDirection = direction;
					lastSlashTime = Date.now();
					if (onSlashCallback) {
						onSlashCallback({
							direction,
							magnitude,
							accelerometer: accelData,
							timestamp: Date.now(),
						});
					}
				}
			}, 50);
		}
	}

	function calculateDirection(accelData) {
		const { x, y } = accelData;
		const absX = Math.abs(x);
		const absY = Math.abs(y);
		const total = absX + absY;
		if (total < 0.1) return DIRECTION_NONE;

		if (absX > absY) {
			return x > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT;
		} else {
			return y > 0 ? DIRECTION_DOWN : DIRECTION_UP;
		}
	}

	function start(onSlash, onMotionChange) {
		init();
		onSlashCallback = onSlash;
		onMotionChangeCallback = onMotionChange;
		isRunning = true;

		accelerometer.start((data) => handleAccelUpdate(data), (err) => console.error('[MotionDetector] Accel error:', err));
		gyroscope.start(() => {}, (err) => console.error('[MotionDetector] Gyro error:', err));
	}

	function stop() {
		isRunning = false;
		if (accelerometer) accelerometer.stop();
		if (gyroscope) gyroscope.stop();
		if (calibrator) calibrator.reset();
		onSlashCallback = null;
		onMotionChangeCallback = null;
		magnitudeBuffer = [];
		currentDirection = DIRECTION_NONE;
		currentMagnitude = 0;
		isCalibrated = false;
	}

	function calibrate() {
		if (!calibrator) init();
		const result = calibrator.collectAndCalculate();
		return {
			isCollecting: result.isCollecting,
			samplesCollected: () => result.samplesCollected(),
			isReady: () => result.isReady(),
			collectSample: (accel, gyro) => result.collectSample(accel, gyro),
			finish: () => result.finish(),
		};
	}

	function applyCalibration() {
		if (!calibrator) init();
		isCalibrated = calibrator.isReady();
		return isCalibrated;
	}

	function getCalibratedData(accelData, gyroData) {
		if (!isCalibrated || !calibrator) return { accelerometer: accelData, gyroscope: gyroData };
		return {
			accelerometer: calibrator.applyOffset(accelData),
			gyroscope: calibrator.applyGyroOffset(gyroData),
		};
	}

	function resetCalibration() {
		if (!calibrator) init();
		calibrator.reset();
		isCalibrated = false;
	}

	function getState() {
		return {
			isRunning,
			isCalibrated,
			currentMagnitude,
			currentDirection,
			threshold,
		};
	}

	return { start, stop, calibrate, applyCalibration, getCalibratedData, resetCalibration, getState, isRunning: () => isRunning };
}
