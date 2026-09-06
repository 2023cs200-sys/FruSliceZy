import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ControlButton } from '../components/ControlButton';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/commonStyles';

export const options = {
	title: 'Connect',
};

export default function ConnectScreen() {
	const router = useRouter();
	const [serverIp, setServerIp] = useState('');
	const [serverPort, setServerPort] = useState('8765');

	const wsUrl = `ws://${serverIp}:${serverPort}`;

	const { status, disconnect, reconnect } = useWebSocket({
		url: wsUrl,
		onConnectionChange: (newStatus) => {
			console.log('[Connect] Connection status:', newStatus);
		},
		onError: (error) => {
			console.error('[Connect] WebSocket error:', error);
		},
		reconnectInterval: 3000,
		maxReconnectAttempts: 10,
	});

	const handleConnect = useCallback(() => {
		if (!serverIp.trim() || !serverPort.trim()) return;
		if (status === 'connected') {
			disconnect();
		} else {
			reconnect();
		}
	}, [status, disconnect, reconnect, serverIp, serverPort]);

	const handleIpChange = useCallback((text) => setServerIp(text), []);
	const handlePortChange = useCallback((text) => setServerPort(text), []);

	const isConnected = status === 'connected';
	const isConnecting = status === 'connecting';
	const isError = status === 'error';
	const canConnect = serverIp.trim().length > 0 && serverPort.trim().length > 0;

	return (
		<View style={commonStyles.screenContainer}>
			<Text style={commonStyles.title}>CONNECT</Text>
			<Text style={commonStyles.subtitle}>Motion Controller</Text>

			<View style={commonStyles.section}>
				<Text style={commonStyles.inputLabel}>SERVER IP</Text>
				<TextInput
					style={commonStyles.inputField}
					value={serverIp}
					onChangeText={handleIpChange}
					placeholder="Enter server IP"
					keyboardType="numbers-and-punctuation"
					autoCapitalize="none"
					editable={!isConnected}
				/>
				<Text style={commonStyles.inputLabel}>PORT</Text>
				<TextInput
					style={[commonStyles.inputField, { width: 100 }]}
					value={serverPort}
					onChangeText={handlePortChange}
					placeholder="8765"
					keyboardType="numeric"
					editable={!isConnected}
				/>
			</View>

			<ConnectionStatus
				status={status}
				onPress={handleConnect}
				ip={serverIp}
				port={serverPort}
				onIpChange={handleIpChange}
				onPortChange={handlePortChange}
				disabled={!canConnect && !isConnected}
			/>

			{isConnected && (
				<View style={styles.navigateContainer}>
					<ControlButton
						title="OPEN CONTROLLER"
						onPress={() => router.replace('/controller')}
						variant="primary"
						icon="wifi"
					/>
				</View>
			)}

			{isError && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>
						⚠ Could not connect to {serverIp || '...'}:{serverPort || '...'}
					</Text>
					<Text style={styles.errorDetail}>
						Make sure the Python WebSocket backend is running on the laptop.
					</Text>
					<Text style={styles.errorDetail}>
						Run: cd python-game && python main.py
					</Text>
				</View>
			)}

			<View style={styles.statusContainer}>
				<Text style={[styles.statusText, { color: isConnected ? colors.success : isError ? colors.error : colors.textSecondary }]}>
					{isConnected ? '● CONNECTED' : isConnecting ? '● CONNECTING...' : isError ? '● CONNECTION FAILED' : '● DISCONNECTED'}
				</Text>
				<Text style={styles.statusDetail}>
					Server: {serverIp}:{serverPort}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	navigateContainer: {
		marginTop: 16,
		alignItems: 'center',
	},
	statusContainer: {
		marginTop: 24,
		alignItems: 'center',
		gap: 4,
	},
	statusText: {
		fontSize: 14,
		fontWeight: '600',
	},
	statusDetail: {
		fontSize: 11,
		color: colors.textSecondary,
		fontFamily: 'monospace',
	},
	errorContainer: {
		marginTop: 16,
		padding: 12,
		backgroundColor: colors.error + '20',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.error,
		alignItems: 'center',
		gap: 4,
	},
	errorText: {
		color: colors.error,
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'center',
	},
	errorDetail: {
		color: colors.textSecondary,
		fontSize: 11,
		textAlign: 'center',
		fontFamily: 'monospace',
	},
});
