import { SAMPLE_COUNT } from '../utils/constants';

export function createCalibrator() {
	let samples = [];
	let baseline = { pitch: 0, roll: 0, yaw: 0 };
	let isReady = false;
	let isCollecting = false;

	function collectSample(accelData, gyroData) {
		if (!isCollecting) return false;
		const sample = {
			accelerometer: {
				x: accelData.x ?? 0,
				y: accelData.y ?? 0,
				z: accelData.z ?? 0,
			},
			gyroscope: {
				x: gyroData.x ?? 0,
				y: gyroData.y ?? 0,
				z: gyroData.z ?? 0,
			},
			timestamp: Date.now(),
		};
		samples.push(sample);
		return samples.length >= SAMPLE_COUNT;
	}

	function calculateBaseline() {
		if (samples.length === 0) return baseline;

		let sumX = 0, sumY = 0, sumZ = 0;
		let gyroSumX = 0, gyroSumY = 0, gyroSumZ = 0;

		for (const sample of samples) {
			sumX += sample.accelerometer.x;
			sumY += sample.accelerometer.y;
			sumZ += sample.accelerometer.z;
			gyroSumX += sample.gyroscope.x;
			gyroSumY += sample.gyroscope.y;
			gyroSumZ += sample.gyroscope.z;
		}

		const count = samples.length;
		const avgX = sumX / count;
		const avgY = sumY / count;
		const avgZ = sumZ / count;
		const avgGyroX = gyroSumX / count;
		const avgGyroY = gyroSumY / count;
		const avgGyroZ = gyroSumZ / count;

		baseline = {
			pitch: Math.atan2(avgX, Math.sqrt(avgY * avgY + avgZ * avgZ)) * (180 / Math.PI),
			roll: Math.atan2(-avgY, avgZ) * (180 / Math.PI),
			yaw: avgGyroZ * (180 / Math.PI),
			accelX: avgX,
			accelY: avgY,
			accelZ: avgZ,
			gyroX: avgGyroX,
			gyroY: avgGyroY,
			gyroZ: avgGyroZ,
		};

		isReady = true;
		return baseline;
	}

	function applyOffset(data) {
		if (!isReady) return data;
		return {
			x: (data.x ?? 0) - baseline.accelX,
			y: (data.y ?? 0) - baseline.accelY,
			z: (data.z ?? 0) - baseline.accelZ,
		};
	}

	function applyGyroOffset(gyroData) {
		if (!isReady) return gyroData;
		return {
			x: (gyroData.x ?? 0) - baseline.gyroX,
			y: (gyroData.y ?? 0) - baseline.gyroY,
			z: (gyroData.z ?? 0) - baseline.gyroZ,
		};
	}

	function collectAndCalculate() {
		isCollecting = true;
		samples = [];
		isReady = false;

		return {
			isCollecting: true,
			samplesCollected: () => samples.length,
			isReady: () => false,
			collectSample,
			finish: () => {
				isCollecting = false;
				const result = calculateBaseline();
				samples = [];
				return result;
			},
		};
	}

	function reset() {
		samples = [];
		baseline = { pitch: 0, roll: 0, yaw: 0, accelX: 0, accelY: 0, accelZ: 0, gyroX: 0, gyroY: 0, gyroZ: 0 };
		isReady = false;
		isCollecting = false;
	}

	function getBaseline() {
		return { ...baseline };
	}

	function isCalibrated() {
		return isReady;
	}

	return {
		collectSample,
		calculateBaseline,
		applyOffset,
		applyGyroOffset,
		collectAndCalculate,
		reset,
		getBaseline,
		isCalibrated: () => isReady,
		isCollecting: () => isCollecting,
		getSamplesCollected: () => samples.length,
	};
}
