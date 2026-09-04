import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const ConnectionStatus = ({ status, onPress, ip, port, onIpChange, onPortChange }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return colors.success;
      case 'connecting': return colors.warning;
      case 'error': return colors.error;
      default: return colors.error;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'CONNECTED';
      case 'connecting': return 'CONNECTING...';
      case 'error': return 'ERROR';
      default: return 'DISCONNECTED';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>SERVER IP</Text>
          <TextInput
            style={styles.input}
            value={ip}
            onChangeText={onIpChange}
            placeholder="192.168.1.10"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PORT</Text>
          <TextInput
            style={[styles.input, styles.portInput]}
            value={port}
            onChangeText={onPortChange}
            placeholder="8765"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: getStatusColor() }]} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.buttonContent}>
          <View style={[styles.statusDot, { backgroundColor: colors.textPrimary }]} />
          <Text style={styles.buttonText}>{getStatusText()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
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
  portInput: {
    width: 80,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 50,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
});