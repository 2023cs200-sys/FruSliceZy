import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../styles/colors';

export const MotionIndicator = ({ accelerometer, gyroscope, calibrated }) => {
  const rotateX = React.useRef(new Animated.Value(0)).current;
  const rotateY = React.useRef(new Animated.Value(0)).current;
  const rotateZ = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!calibrated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
      return;
    }

    const updateRotation = () => {
      if (!accelerometer || !gyroscope) return;

      const targetX = Math.max(-30, Math.min(30, accelerometer.y * 30));
      const targetY = Math.max(-30, Math.min(30, -accelerometer.x * 30));
      const targetZ = Math.max(-45, Math.min(45, gyroscope.z * 45));

      Animated.timing(rotateX, {
        toValue: targetX,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      Animated.timing(rotateY, {
        toValue: targetY,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      Animated.timing(rotateZ, {
        toValue: targetZ,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    };

    const interval = setInterval(updateRotation, 50);
    return () => clearInterval(interval);
  }, [accelerometer, gyroscope, calibrated, rotateX, rotateY, rotateZ, pulseAnim]);

  const animatedStyle = {
    transform: [
      { rotateX: rotateX.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] }) },
      { rotateY: rotateY.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] }) },
      { rotateZ: rotateZ.interpolate({ inputRange: [-45, 45], outputRange: ['-45deg', '45deg'] }) },
    ],
  };

  const pulseStyle = {
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.phoneFrame, animatedStyle]}>
        <Animated.View style={[styles.screen, pulseStyle]} />
        <View style={styles.camera} />
        <View style={styles.sensorIndicator} />
      </Animated.View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>TILT TO MOVE</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>ROTATE TO SLASH</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  phoneFrame: {
    width: 120,
    height: 240,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  screen: {
    width: '90%',
    height: '90%',
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  camera: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textSecondary,
  },
  sensorIndicator: {
    position: 'absolute',
    bottom: 16,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    opacity: 0.6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});