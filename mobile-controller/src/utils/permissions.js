import { Accelerometer, Gyroscope } from 'expo-sensors';

export async function requestMotionPermissions() {
	try {
		const accelerometerResult = await Accelerometer.requestPermissionsAsync();
		const gyroscopeResult = await Gyroscope.requestPermissionsAsync();
		const granted = accelerometerResult.granted && gyroscopeResult.granted;
		return {
			granted,
			accelerometer: accelerometerResult.granted,
			gyroscope: gyroscopeResult.granted,
			status: granted ? 'granted' : 'denied',
		};
	} catch (error) {
		console.error('[permissions] Failed to request motion permissions:', error);
		return { granted: false, accelerometer: false, gyroscope: false, status: 'denied', error };
	}
}

export async function checkMotionPermissions() {
	try {
		const accelerometerResult = await Accelerometer.getPermissionsAsync();
		const gyroscopeResult = await Gyroscope.getPermissionsAsync();
		const granted = accelerometerResult.granted && gyroscopeResult.granted;
		return {
			granted,
			accelerometer: accelerometerResult.granted,
			gyroscope: gyroscopeResult.granted,
			status: granted ? 'granted' : 'denied',
		};
	} catch (error) {
		console.error('[permissions] Failed to check motion permissions:', error);
		return { granted: false, accelerometer: false, gyroscope: false, status: 'denied', error };
	}
}

export async function checkSensorAvailability() {
	try {
		const accelerometerAvailable = await Accelerometer.isAvailableAsync();
		const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
		return {
			available: accelerometerAvailable && gyroscopeAvailable,
			accelerometer: accelerometerAvailable,
			gyroscope: gyroscopeAvailable,
		};
	} catch (error) {
		console.error('[permissions] Failed to check sensor availability:', error);
		return { available: false, accelerometer: false, gyroscope: false };
	}
}
