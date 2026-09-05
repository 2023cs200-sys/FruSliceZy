import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../styles/colors';

const iconMap = {
  wifi: '📶',
  close: '✕',
  rotate: '↻',
  'rotate-3d': '🔄',
  undo: '↩',
  play: '▶',
  stop: '■',
};

export const ControlButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  icon,
  loading = false 
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const { container, text } = getStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        container,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : icon ? (
          <Text style={styles.icon}>{iconMap[icon] || icon}</Text>
        ) : null}
        <Text style={[styles.buttonText, text]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryContainer: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  secondaryText: {
    color: colors.accent,
  },
  dangerContainer: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dangerText: {
    color: colors.textPrimary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostText: {
    color: colors.textSecondary,
  },
});