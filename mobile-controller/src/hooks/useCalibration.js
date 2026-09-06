import { useState, useCallback, useRef } from 'react';
import { createCalibrator } from '../sensors/calibration';

export function useCalibration() {
	const [calibrated, setCalibrated] = useState(false);
	const [calibrationOffset, setCalibrationOffset] = useState({ pitch: 0, roll: 0, yaw: 0 });
	const calibratorRef = useRef(null);
	const calibrationResultRef = useRef(null);

	const calibrate = useCallback((accel, gyro) => {
		if (!calibratorRef.current) {
			calibratorRef.current = createCalibrator();
		}
		const calibrator = calibratorRef.current;

		if (!calibrationResultRef.current || !calibrationResultRef.current.isCollecting()) {
			calibrationResultRef.current = calibrator.collectAndCalculate();
		}

		const result = calibrationResultRef.current;
		result.collectSample(accel, gyro);

		if (result.samplesCollected() >= 20) {
			const baseline = result.finish();
			const offset = { pitch: baseline.pitch, roll: baseline.roll, yaw: baseline.yaw };
			setCalibrationOffset(offset);
			setCalibrated(true);
			calibrationResultRef.current = null;
			return offset;
		}
		return { pitch: 0, roll: 0, yaw: 0 };
	}, []);

	const resetCalibration = useCallback(() => {
		if (calibratorRef.current) {
			calibratorRef.current.reset();
		}
		calibrationResultRef.current = null;
		setCalibrationOffset({ pitch: 0, roll: 0, yaw: 0 });
		setCalibrated(false);
	}, []);

	const applyCalibration = useCallback((accel, gyro) => {
		if (!calibrated || !calibratorRef.current) return { accelerometer: accel, gyroscope: gyro };
		const calibratedAccel = calibratorRef.current.applyOffset(accel);
		const calibratedGyro = calibratorRef.current.applyGyroOffset(gyro);
		return {
			accelerometer: calibratedAccel,
			gyroscope: calibratedGyro,
		};
	}, [calibrated]);

	return { calibrated, calibrationOffset, calibrate, resetCalibration, applyCalibration };
}
