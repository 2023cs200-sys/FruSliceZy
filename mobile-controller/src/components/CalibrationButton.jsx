import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors } from '../styles/colors';
import { SAMPLE_COUNT } from '../utils/constants';
import { ControlButton } from './ControlButton';

export const CalibrationButton = ({ calibrated, onPress, isCollecting, samplesCollected }) => {
	const pulseAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (isCollecting) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 600,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: false,
					}),
					Animated.timing(pulseAnim, {
						toValue: 0,
						duration: 600,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: false,
					}),
				])
			).start();
		} else {
			pulseAnim.stopAnimation(() => {
				pulseAnim.setValue(0);
			});
		}
	}, [isCollecting, pulseAnim]);

	const pulseStyle = {
		opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
		transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
	};

	if (calibrated) {
		return (
			<View style={[styles.container, styles.calibratedContainer]}>
				<View style={styles.calibratedContent}>
					<Text style={styles.calibratedIcon}>✅</Text>
					<Text style={styles.calibratedText}>CALIBRATED</Text>
				</View>
				<ControlButton title="RECALIBRATE" onPress={onPress} variant="secondary" icon="rotate-3d" />
			</View>
		);
	}

	return (
		<Animated.View style={[styles.container, isCollecting && pulseStyle]}>
			{isCollecting ? (
				<View style={styles.collectingContent}>
					<Text style={styles.collectingText}>HOLD STILL</Text>
					<Text style={styles.sampleCount}>
						{samplesCollected} / {SAMPLE_COUNT}
					</Text>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${(samplesCollected / SAMPLE_COUNT) * 100}%` }]} />
					</View>
				</View>
			) : (
				<ControlButton title="CALIBRATE" onPress={onPress} variant="secondary" icon="rotate-3d" />
			)}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		minWidth: 140,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	calibratedContainer: {
		backgroundColor: colors.success + '15',
		borderWidth: 2,
		borderColor: colors.success,
	},
	calibratedContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	calibratedIcon: {
		fontSize: 18,
	},
	calibratedText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: colors.success,
		letterSpacing: 1,
	},
	collectingContent: {
		alignItems: 'center',
		gap: 8,
	},
	collectingText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: colors.warning,
		letterSpacing: 1,
	},
	sampleCount: {
		fontSize: 12,
		color: colors.textSecondary,
		fontFamily: 'monospace',
	},
	progressBar: {
		width: 100,
		height: 4,
		backgroundColor: colors.border,
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: colors.accent,
		borderRadius: 2,
	},
});
