import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ControlButton } from '../components/ControlButton';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/commonStyles';
import { MOTION_THRESHOLD, SAMPLE_COUNT, FILTER_WINDOW_SIZE, RECONNECT_INTERVAL_MS, MAX_RECONNECT_ATTEMPTS } from '../utils/constants';

export const options = {
	title: 'Settings',
};

export default function SettingsScreen() {
	const [motionThreshold, setMotionThreshold] = useState(MOTION_THRESHOLD);
	const [sampleCount, setSampleCount] = useState(SAMPLE_COUNT);
	const [filterWindowSize, setFilterWindowSize] = useState(FILTER_WINDOW_SIZE);
	const [reconnectInterval, setReconnectInterval] = useState(RECONNECT_INTERVAL_MS);
	const [maxReconnectAttempts, setMaxReconnectAttempts] = useState(MAX_RECONNECT_ATTEMPTS);
	const [isCalibrated, setIsCalibrated] = useState(false);

	const handleResetSettings = useCallback(() => {
		setMotionThreshold(MOTION_THRESHOLD);
		setSampleCount(SAMPLE_COUNT);
		setFilterWindowSize(FILTER_WINDOW_SIZE);
		setReconnectInterval(RECONNECT_INTERVAL_MS);
		setMaxReconnectAttempts(MAX_RECONNECT_ATTEMPTS);
		setIsCalibrated(false);
	}, []);

	const handleSaveSettings = useCallback(() => {
		console.log('[Settings] Saved:', {
			motionThreshold,
			sampleCount,
			filterWindowSize,
			reconnectInterval,
			maxReconnectAttempts,
		});
	}, [motionThreshold, sampleCount, filterWindowSize, reconnectInterval, maxReconnectAttempts]);

	return (
		<ScrollView style={commonStyles.screenContainer}>
			<Text style={commonStyles.title}>SETTINGS</Text>
			<Text style={commonStyles.subtitle}>Configuration</Text>

			<View style={commonStyles.section}>
				<Text style={commonStyles.sectionTitle}>MOTION DETECTION</Text>

				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Motion Threshold</Text>
					<Text style={styles.settingValue}>{motionThreshold.toFixed(1)}</Text>
				</View>
				<View style={styles.sliderContainer}>
					<Text style={styles.sliderMin}>0.5</Text>
					<View style={styles.sliderTrack}>
						<View
							style={[
								styles.sliderFill,
								{ width: `${((motionThreshold - 0.5) / 4.5) * 100}%` },
							]}
						/>
					</View>
					<Text style={styles.sliderMax}>5.0</Text>
				</View>
				<View style={styles.sliderButtons}>
					<ControlButton
						title="-"
						onPress={() => setMotionThreshold(Math.max(0.5, motionThreshold - 0.1))}
						variant="secondary"
						disabled={motionThreshold <= 0.5}
					/>
					<ControlButton
						title="+"
						onPress={() => setMotionThreshold(Math.min(5.0, motionThreshold + 0.1))}
						variant="secondary"
						disabled={motionThreshold >= 5.0}
					/>
				</View>

				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Sample Count</Text>
					<Text style={styles.settingValue}>{sampleCount}</Text>
				</View>
				<View style={styles.sliderButtons}>
					<ControlButton
						title="-"
						onPress={() => setSampleCount(Math.max(5, sampleCount - 1))}
						variant="secondary"
						disabled={sampleCount <= 5}
					/>
					<ControlButton
						title="+"
						onPress={() => setSampleCount(Math.min(50, sampleCount + 1))}
						variant="secondary"
						disabled={sampleCount >= 50}
					/>
				</View>

				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Filter Window Size</Text>
					<Text style={styles.settingValue}>{filterWindowSize}</Text>
				</View>
				<View style={styles.sliderButtons}>
					<ControlButton
						title="-"
						onPress={() => setFilterWindowSize(Math.max(2, filterWindowSize - 1))}
						variant="secondary"
						disabled={filterWindowSize <= 2}
					/>
					<ControlButton
						title="+"
						onPress={() => setFilterWindowSize(Math.min(10, filterWindowSize + 1))}
						variant="secondary"
						disabled={filterWindowSize >= 10}
					/>
				</View>
			</View>

			<View style={commonStyles.section}>
				<Text style={commonStyles.sectionTitle}>CONNECTION</Text>

				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Reconnect Interval</Text>
					<Text style={styles.settingValue}>{reconnectInterval}ms</Text>
				</View>
				<View style={styles.sliderButtons}>
					<ControlButton
						title="-"
						onPress={() => setReconnectInterval(Math.max(1000, reconnectInterval - 500))}
						variant="secondary"
						disabled={reconnectInterval <= 1000}
					/>
					<ControlButton
						title="+"
						onPress={() => setReconnectInterval(Math.min(10000, reconnectInterval + 500))}
						variant="secondary"
						disabled={reconnectInterval >= 10000}
					/>
				</View>

				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Max Reconnect Attempts</Text>
					<Text style={styles.settingValue}>{maxReconnectAttempts}</Text>
				</View>
				<View style={styles.sliderButtons}>
					<ControlButton
						title="-"
						onPress={() => setMaxReconnectAttempts(Math.max(1, maxReconnectAttempts - 1))}
						variant="secondary"
						disabled={maxReconnectAttempts <= 1}
					/>
					<ControlButton
						title="+"
						onPress={() => setMaxReconnectAttempts(Math.min(20, maxReconnectAttempts + 1))}
						variant="secondary"
						disabled={maxReconnectAttempts >= 20}
					/>
				</View>
			</View>

			<View style={commonStyles.section}>
				<Text style={commonStyles.sectionTitle}>CALIBRATION</Text>
				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Status</Text>
					<Text style={[styles.settingValue, { color: isCalibrated ? colors.success : colors.textSecondary }]}>
						{isCalibrated ? 'CALIBRATED' : 'NOT CALIBRATED'}
					</Text>
				</View>
			</View>

			<View style={styles.buttonRow}>
				<ControlButton title="SAVE" onPress={handleSaveSettings} variant="primary" />
				<ControlButton title="RESET" onPress={handleResetSettings} variant="ghost" />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	settingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	settingLabel: {
		fontSize: 13,
		color: colors.textSecondary,
	},
	settingValue: {
		fontSize: 14,
		fontWeight: 'bold',
		color: colors.textPrimary,
		fontFamily: 'monospace',
	},
	sliderContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
	},
	sliderTrack: {
		flex: 1,
		height: 6,
		backgroundColor: colors.border,
		borderRadius: 3,
		overflow: 'hidden',
	},
	sliderFill: {
		height: '100%',
		backgroundColor: colors.accent,
		borderRadius: 3,
	},
	sliderMin: {
		fontSize: 10,
		color: colors.textSecondary,
		fontFamily: 'monospace',
		width: 24,
	},
	sliderMax: {
		fontSize: 10,
		color: colors.textSecondary,
		fontFamily: 'monospace',
		width: 24,
		textAlign: 'right',
	},
	sliderButtons: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 24,
	},
});
