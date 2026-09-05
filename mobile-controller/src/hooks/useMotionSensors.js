import { useEffect, useRef, useState, useCallback } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

export function useMotionSensors() {
	const [accelerometer, setAccelerometer] = useState(null);
	const [gyroscope, setGyroscope] = useState(null);
	const [isAvailable, setIsAvailable] = useState(true);
	const accelSubscriptionRef = useRef(null);
	const gyroSubscriptionRef = useRef(null);

	const startUpdates = useCallback(() => {
		try {
			Accelerometer.setUpdateInterval(16);
			Gyroscope.setUpdateInterval(16);
			accelSubscriptionRef.current = Accelerometer.addListener((data) => {
				setAccelerometer({ x: data.x ?? 0, y: data.y ?? 0, z: data.z ?? 0 });
			});
			gyroSubscriptionRef.current = Gyroscope.addListener((data) => {
				setGyroscope({ x: data.x ?? 0, y: data.y ?? 0, z: data.z ?? 0 });
			});
			setIsAvailable(true);
		} catch (error) {
			console.error('[useMotionSensors] Failed to start sensors:', error);
			setIsAvailable(false);
		}
	}, []);

	const stopUpdates = useCallback(() => {
		accelSubscriptionRef.current?.remove();
		gyroSubscriptionRef.current?.remove();
		accelSubscriptionRef.current = null;
		gyroSubscriptionRef.current = null;
	}, []);

	useEffect(() => {
		startUpdates();
		return () => stopUpdates();
	}, [startUpdates, stopUpdates]);

	return { accelerometer, gyroscope, startUpdates, stopUpdates, isAvailable };
}
