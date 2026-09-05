import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMotionSensors } from '../hooks/useMotionSensors';
import { useCalibration } from '../hooks/useCalibration';
import { createMotionDetector } from '../sensors/motionDetector';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ControlButton } from '../components/ControlButton';
import { CalibrationButton } from '../components/CalibrationButton';
import { SensorDisplay } from '../components/SensorDisplay';
import { MotionIndicator } from '../components/MotionIndicator';
import { colors } from '../styles/colors';

export const options = {
  title: 'Controller',
};

export default function ControllerScreen() {
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('8765');
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationData, setCalibrationData] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const [motionStatus, setMotionStatus] = useState('READY');
  const [lastSlashDirection, setLastSlashDirection] = useState(null);

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

  const motionDetectorRef = React.useRef(null);

  useEffect(() => {
    motionDetectorRef.current = createMotionDetector({
      threshold: 2.5,
      slashDuration: 500,
      cooldown: 1000,
    });
    return () => {
      motionDetectorRef.current?.stop();
    };
  }, []);

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

  useEffect(() => {
    if (!motionDetectorRef.current) return;

    const detector = motionDetectorRef.current;

    const handleSlash = (data) => {
      setLastSlashDirection(data.direction);
      setMotionStatus('SLASH DETECTED: ' + data.direction);
      setTimeout(() => setMotionStatus('READY'), 1500);
    };

    const handleMotionChange = (data) => {
      if (data.magnitude > 2.5) {
        setMotionStatus('MOTION DETECTED');
      } else {
        setMotionStatus('READY');
      }
    };

    detector.start(handleSlash, handleMotionChange, (baseline) => {
      setCalibrationData({ pitch: baseline.pitch, roll: baseline.roll, yaw: baseline.yaw });
      setIsCalibrated(true);
    });

    return () => detector.stop();
  }, [status, isAvailable]);

  const handleCalibrate = useCallback(() => {
    const detector = motionDetectorRef.current;
    if (!detector || !accelerometer || !gyroscope) return;

    setMotionStatus('CALIBRATING...');
    const cal = calibrate(accelerometer, gyroscope);
    setCalibrationData(cal);
    setIsCalibrated(true);
    sendCalibrate();
    setMotionStatus('READY');
  }, [accelerometer, gyroscope, calibrate, sendCalibrate]);

  const handleResetCalibration = useCallback(() => {
    resetCalibration();
    setIsCalibrated(false);
    setCalibrationData({ pitch: 0, roll: 0, yaw: 0 });
    setMotionStatus('READY');
  }, [resetCalibration]);

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
	          disabled={(!serverIp.trim() || !serverPort.trim()) && status !== 'connected'}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MOTION STATUS</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: motionStatus === 'READY' ? colors.success : colors.warning }]}>
            ● {motionStatus}
          </Text>
          {lastSlashDirection && (
            <Text style={styles.slashDirection}>
              Last Slash: {lastSlashDirection}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <ControlButton
          title={isConnected ? 'DISCONNECT' : isConnecting ? 'CONNECTING...' : 'CONNECT'}
          onPress={handleConnect}
          variant={isConnected ? 'danger' : 'primary'}
          disabled={isConnecting}
          icon={isConnected ? 'close' : 'wifi'}
        />

        <CalibrationButton
          calibrated={isCalibrated}
          onPress={handleCalibrate}
          isCollecting={!isCalibrated && motionStatus === 'CALIBRATING...'}
          samplesCollected={calibrated ? 20 : 0}
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  slashDirection: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: 'bold',
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
