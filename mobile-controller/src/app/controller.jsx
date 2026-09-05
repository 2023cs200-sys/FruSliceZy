import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMotionSensors } from '../hooks/useMotionSensors';
import { useCalibration } from '../hooks/useCalibration';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ControlButton } from '../components/ControlButton';
import { SensorDisplay } from '../components/SensorDisplay';
import { MotionIndicator } from '../components/MotionIndicator';
import { colors } from '../styles/colors';

export const options = {
  title: 'Controller',
};

export default function ControllerScreen() {
  const [serverIp, setServerIp] = useState('192.168.1.10');
  const [serverPort, setServerPort] = useState('8765');
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationData, setCalibrationData] = useState({ pitch: 0, roll: 0, yaw: 0 });

  const wsUrl = `ws://${serverIp}:${serverPort}`;

  const {
    status,
    sendMotion,
    sendCalibrate,
    sendStatus,
    disconnect,
    reconnect,
    lastMessage,
  } = useWebSocket({
    url: wsUrl,
    onConnectionChange: (newStatus) => {
      console.log('[Controller] Connection status:', newStatus);
    },
    onError: (error) => {
      console.error('[Controller] WebSocket error:', error);
    },
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

  const { 
    accelerometer, 
    gyroscope, 
    startUpdates, 
    stopUpdates,
    isAvailable 
  } = useMotionSensors();

  const { 
    calibrated, 
    calibrate, 
    resetCalibration,
    applyCalibration 
  } = useCalibration();

  useEffect(() => {
    if (status === 'connected' && isAvailable) {
      startUpdates();
      sendStatus('ready');
    } else {
      stopUpdates();
    }

    return () => stopUpdates();
  }, [status, isAvailable, startUpdates, stopUpdates, sendStatus]);

  useEffect(() => {
    if (status === 'connected' && accelerometer && gyroscope) {
      const calibratedData = applyCalibration(accelerometer, gyroscope);
      
      sendMotion({
        type: 'motion',
        timestamp: Date.now(),
        accelerometer: calibratedData.accelerometer,
        gyroscope: calibratedData.gyroscope,
      });
    }
  }, [accelerometer, gyroscope, status, applyCalibration, sendMotion]);

  const handleCalibrate = () => {
    const cal = calibrate(accelerometer, gyroscope);
    setCalibrationData(cal);
    setIsCalibrated(true);
    sendCalibrate();
  };

  const handleResetCalibration = () => {
    resetCalibration();
    setIsCalibrated(false);
    setCalibrationData({ pitch: 0, roll: 0, yaw: 0 });
  };

  const handleConnect = () => {
    if (status === 'connected') {
      disconnect();
    } else {
      reconnect();
    }
  };

  const handleIpChange = (text) => setServerIp(text);
  const handlePortChange = (text) => setServerPort(text);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MOTION CONTROLLER</Text>
        <ConnectionStatus 
          status={status} 
          onPress={handleConnect}
          ip={serverIp}
          port={serverPort}
          onIpChange={handleIpChange}
          onPortChange={handlePortChange}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SENSOR DATA</Text>
        <SensorDisplay 
          accelerometer={accelerometer} 
          gyroscope={gyroscope} 
          calibrated={calibrationData}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MOTION INDICATOR</Text>
        <MotionIndicator 
          accelerometer={accelerometer} 
          gyroscope={gyroscope}
          calibrated={isCalibrated}
        />
      </View>

      <View style={styles.controls}>
        <ControlButton
          title={isConnected ? 'DISCONNECT' : isConnecting ? 'CONNECTING...' : 'CONNECT'}
          onPress={handleConnect}
          variant={isConnected ? 'danger' : 'primary'}
          disabled={isConnecting}
          icon={isConnected ? 'close' : 'wifi'}
        />

        <ControlButton
          title={isCalibrated ? 'RECALIBRATE' : 'CALIBRATE'}
          onPress={handleCalibrate}
          variant="secondary"
          disabled={!isConnected || !accelerometer}
          icon="rotate-3d"
        />

        {isCalibrated && (
          <ControlButton
            title="RESET CALIBRATION"
            onPress={handleResetCalibration}
            variant="ghost"
            icon="undo"
          />
        )}
      </View>

      <View style={styles.status}>
        <Text style={[styles.statusText, { color: isConnected ? colors.success : colors.error }]}>
          {isConnected ? '● STREAMING MOTION DATA' : '● WAITING FOR CONNECTION'}
        </Text>
        <Text style={styles.statusDetail}>
          Server: {serverIp}:{serverPort} | Updates: {accelerometer ? 'ACTIVE' : 'INACTIVE'}
        </Text>
        {lastMessage && lastMessage.type === 'ack' && (
          <Text style={styles.statusDetail}>
            Last ACK: {lastMessage.original_type}
          </Text>
        )}
      </View>

      {!isAvailable && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠ Motion sensors not available on this device
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
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
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  status: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusDetail: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
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