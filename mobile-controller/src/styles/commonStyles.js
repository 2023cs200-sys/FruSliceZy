import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const commonStyles = StyleSheet.create({
	screenContainer: {
		flex: 1,
		backgroundColor: colors.background,
		padding: 24,
	},
	section: {
		marginBottom: 24,
		padding: 16,
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: '600',
		color: colors.textSecondary,
		marginBottom: 12,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: colors.textPrimary,
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 15,
		color: colors.textSecondary,
		letterSpacing: 3,
		textTransform: 'uppercase',
		marginBottom: 56,
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
	},
	statusBadgeConnected: {
		backgroundColor: colors.success + '20',
		borderWidth: 1,
		borderColor: colors.success,
	},
	statusBadgeDisconnected: {
		backgroundColor: colors.error + '20',
		borderWidth: 1,
		borderColor: colors.error,
	},
	statusBadgeConnecting: {
		backgroundColor: colors.warning + '20',
		borderWidth: 1,
		borderColor: colors.warning,
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 0.5,
	},
	statusTextConnected: {
		color: colors.success,
	},
	statusTextDisconnected: {
		color: colors.error,
	},
	statusTextConnecting: {
		color: colors.warning,
	},
	inputField: {
		height: 44,
		paddingHorizontal: 12,
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 8,
		color: colors.textPrimary,
		fontSize: 14,
		fontFamily: 'monospace',
	},
	inputLabel: {
		fontSize: 10,
		fontWeight: '600',
		color: colors.textSecondary,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	button: {
		minWidth: 140,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	buttonText: {
		fontSize: 14,
		fontWeight: 'bold',
		letterSpacing: 0.5,
	},
	placeholder: {
		color: colors.textSecondary,
		textAlign: 'center',
		fontSize: 14,
		lineHeight: 22,
	},
	warning: {
		marginTop: 16,
		padding: 12,
		backgroundColor: colors.warning + '20',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.warning,
	},
	warningText: {
		color: colors.warning,
		textAlign: 'center',
		fontSize: 12,
	},
});
