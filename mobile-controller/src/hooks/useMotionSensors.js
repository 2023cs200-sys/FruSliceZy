import { useEffect, useRef, useState, useCallback } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { checkSensorAvailability } from '../utils/permissions';

export function useMotionSensors() {
	const [accelerometer, setAccelerometer] = useState(null);
	const [gyroscope, setGyroscope] = useState(null);
	const [isAvailable, setIsAvailable] = useState(true);
	const accelerometerSubscriptionRef = useRef(null);
	const gyroscopeSubscriptionRef = useRef(null);
	const gyroscopeHasDataRef = useRef(false);

	const startUpdates = useCallback(() => {
		if (accelerometerSubscriptionRef.current || gyroscopeSubscriptionRef.current) return;

		try {
			Accelerometer.setUpdateInterval(50);
			Gyroscope.setUpdateInterval(50);
			accelerometerSubscriptionRef.current = Accelerometer.addListener((data) => {
				setAccelerometer({ x: data.x, y: data.y, z: data.z });
				if (!gyroscopeHasDataRef.current) {
					setGyroscope({ x: data.y, y: -data.x, z: 0 });
				}
			});
			gyroscopeSubscriptionRef.current = Gyroscope.addListener((data) => {
				if (Math.abs(data.x) > 0.001 || Math.abs(data.y) > 0.001 || Math.abs(data.z) > 0.001) {
					gyroscopeHasDataRef.current = true;
				}
				setGyroscope({ x: data.x, y: data.y, z: data.z });
			});

			setIsAvailable(true);
		} catch (error) {
			console.error('[useMotionSensors] Failed to start sensors:', error);
			setIsAvailable(false);
		}
	}, []);

	const stopUpdates = useCallback(() => {
		if (accelerometerSubscriptionRef.current) {
			accelerometerSubscriptionRef.current.remove();
			accelerometerSubscriptionRef.current = null;
		}
		if (gyroscopeSubscriptionRef.current) {
			gyroscopeSubscriptionRef.current.remove();
			gyroscopeSubscriptionRef.current = null;
		}
		gyroscopeHasDataRef.current = false;
		setAccelerometer(null);
		setGyroscope(null);
	}, []);

	useEffect(() => {
		let cancelled = false;

		const initializeSensors = async () => {
			const availabilityResult = await checkSensorAvailability();
			if (!cancelled) {
				setIsAvailable(availabilityResult.available);
			}
		};

		initializeSensors();

		return () => stopUpdates();
	}, [stopUpdates]);

	return { accelerometer, gyroscope, startUpdates, stopUpdates, isAvailable };
}
