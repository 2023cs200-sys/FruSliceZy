import { useState, useCallback } from 'react';

export function useCalibration() {
	const [calibrated, setCalibrated] = useState(false);
	const [calibrationOffset, setCalibrationOffset] = useState({ pitch: 0, roll: 0, yaw: 0 });

	const calibrate = useCallback((accel, gyro) => {
		const pitch = Math.atan2(accel.x, Math.sqrt(accel.y * accel.y + accel.z * accel.z)) * (180 / Math.PI);
		const roll = Math.atan2(-accel.y, accel.z) * (180 / Math.PI);
		const offset = { pitch, roll, yaw: 0 };
		setCalibrationOffset(offset);
		setCalibrated(true);
		return offset;
	}, []);

	const resetCalibration = useCallback(() => {
		setCalibrationOffset({ pitch: 0, roll: 0, yaw: 0 });
		setCalibrated(false);
	}, []);

	const applyCalibration = useCallback((accel, gyro) => {
		if (!calibrated) return { accelerometer: accel, gyroscope: gyro };
		return {
			accelerometer: { x: accel.x, y: accel.y, z: accel.z },
			gyroscope: {
				x: gyro.x - calibrationOffset.pitch * (Math.PI / 180),
				y: gyro.y - calibrationOffset.roll * (Math.PI / 180),
				z: gyro.z - calibrationOffset.yaw * (Math.PI / 180),
			},
		};
	}, [calibrated, calibrationOffset]);

	return { calibrated, calibrationOffset, calibrate, resetCalibration, applyCalibration };
}
