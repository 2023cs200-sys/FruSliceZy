import { useState, useCallback, useRef } from 'react';
import { createCalibrator } from '../sensors/calibration';

export function useCalibration() {
	const [calibrated, setCalibrated] = useState(false);
	const [calibrationOffset, setCalibrationOffset] = useState({ pitch: 0, roll: 0, yaw: 0 });
	const calibratorRef = useRef(null);

	const calibrate = useCallback((accel, gyro) => {
		if (!calibratorRef.current) {
			calibratorRef.current = createCalibrator();
		}
		const calibrator = calibratorRef.current;
		calibrator.collectSample(accel, gyro);
		if (calibrator.getSamplesCollected() >= 20) {
			const baseline = calibrator.collectAndCalculate().finish();
			const offset = { pitch: baseline.pitch, roll: baseline.roll, yaw: baseline.yaw };
			setCalibrationOffset(offset);
			setCalibrated(true);
			return offset;
		}
		return { pitch: 0, roll: 0, yaw: 0 };
	}, []);

	const resetCalibration = useCallback(() => {
		if (calibratorRef.current) {
			calibratorRef.current.reset();
		}
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
