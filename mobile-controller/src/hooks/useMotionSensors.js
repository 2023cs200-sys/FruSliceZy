import { useEffect, useRef, useState, useCallback } from 'react';
import { createAccelerometer } from '../sensors/accelerometer';
import { createGyroscope } from '../sensors/gyroscope';
import { checkSensorAvailability } from '../utils/permissions';

export function useMotionSensors() {
	const [accelerometer, setAccelerometer] = useState(null);
	const [gyroscope, setGyroscope] = useState(null);
	const [isAvailable, setIsAvailable] = useState(true);
	const accelInstanceRef = useRef(null);
	const gyroInstanceRef = useRef(null);

	const startUpdates = useCallback(() => {
		try {
			const accel = createAccelerometer();
			const gyro = createGyroscope();
			accelInstanceRef.current = accel;
			gyroInstanceRef.current = gyro;

			accel.start(
				(data) => setAccelerometer({ x: data.x, y: data.y, z: data.z }),
				(err) => {
					console.error('[useMotionSensors] Accel error:', err);
					setIsAvailable(false);
				}
			);

			gyro.start(
				() => {},
				(err) => {
					console.error('[useMotionSensors] Gyro error:', err);
					setIsAvailable(false);
				}
			);

			setIsAvailable(true);
		} catch (error) {
			console.error('[useMotionSensors] Failed to start sensors:', error);
			setIsAvailable(false);
		}
	}, []);

	const stopUpdates = useCallback(() => {
		if (accelInstanceRef.current) {
			accelInstanceRef.current.stop();
			accelInstanceRef.current = null;
		}
		if (gyroInstanceRef.current) {
			gyroInstanceRef.current.stop();
			gyroInstanceRef.current = null;
		}
		setAccelerometer(null);
		setGyroscope(null);
	}, []);

	useEffect(() => {
		checkSensorAvailability().then((result) => {
			setIsAvailable(result.available);
		});
		startUpdates();
		return () => stopUpdates();
	}, [startUpdates, stopUpdates]);

	return { accelerometer, gyroscope, startUpdates, stopUpdates, isAvailable };
}
