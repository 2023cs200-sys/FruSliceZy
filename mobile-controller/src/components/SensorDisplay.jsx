import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const SensorDisplay = ({ accelerometer, gyroscope, calibrated }) => {
  const formatValue = (value) => {
    if (value === null || value === undefined) return '0.00';
    return value.toFixed(2);
  };

  const renderSensorRow = (label, value, unit = '') => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {formatValue(value)}
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCELEROMETER (m/s²)</Text>
        <View style={styles.grid}>
          {renderSensorRow('X', accelerometer?.x)}
          {renderSensorRow('Y', accelerometer?.y)}
          {renderSensorRow('Z', accelerometer?.z)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GYROSCOPE (rad/s)</Text>
        <View style={styles.grid}>
          {renderSensorRow('X', gyroscope?.x)}
          {renderSensorRow('Y', gyroscope?.y)}
          {renderSensorRow('Z', gyroscope?.z)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CALIBRATION OFFSET (deg)</Text>
        <View style={styles.grid}>
          {renderSensorRow('PITCH', calibrated.pitch, '°')}
          {renderSensorRow('ROLL', calibrated.roll, '°')}
          {renderSensorRow('YAW', calibrated.yaw, '°')}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  row: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  unit: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});