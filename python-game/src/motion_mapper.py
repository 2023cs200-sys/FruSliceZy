import math
import time
from collections import deque


class MotionMapper:
    """Maps smartphone sensor data to 3D sword position and rotation."""

    DEFAULT_CONFIG = {
        'sensitivity': 7.0,
        'smoothing': 5.0,
        'motion_threshold': 2.5,
        'slash_threshold': 5.0,
        'sword_speed': 15.0,
        'rotation_sensitivity': 45.0,
        'max_x': 1.0,
        'max_y': 1.0,
        'deadzone': 0.1,
        'filter_window': 5,
    }

    def __init__(self, config=None):
        self.config = {**self.DEFAULT_CONFIG, **(config or {})}
        self.accel_buffer = deque(maxlen=self.config['filter_window'])
        self.gyro_buffer = deque(maxlen=self.config['filter_window'])
        self.last_motion_time = 0
        self.last_slash_time = 0
        self.is_calibrated = False
        self.calibration_offset = {'x': 0, 'y': 0, 'z': 0}
        self.current_sword_pos = {'x': 0.0, 'y': 0.0}
        self.current_sword_rot = {'z': 0.0}
        self.motion_magnitude = 0.0
        self.is_slashing = False
        self.slash_direction = 'NONE'

    def set_calibration(self, offset_x, offset_y, offset_z):
        self.is_calibrated = True
        self.calibration_offset = {'x': offset_x, 'y': offset_y, 'z': offset_z}

    def reset_calibration(self):
        self.is_calibrated = False
        self.calibration_offset = {'x': 0, 'y': 0, 'z': 0}
        self.accel_buffer.clear()
        self.gyro_buffer.clear()

    def _apply_deadzone(self, value):
        if abs(value) < self.config['deadzone']:
            return 0.0
        return value

    def _clamp(self, value, min_val, max_val):
        return max(min_val, min(value, max_val))

    def _smooth(self, new_value, buffer):
        buffer.append(new_value)
        if len(buffer) == 0:
            return new_value
        return sum(buffer) / len(buffer)

    def _calculate_magnitude(self, x, y, z):
        return math.sqrt(x ** 2 + y ** 2 + z ** 2)

    def _detect_slash(self, magnitude):
        now = time.time()
        if now - self.last_slash_time < 1.0:
            return False, 'NONE'
        if magnitude < self.config['slash_threshold']:
            return False, 'NONE'
        self.last_slash_time = now
        return True, self._determine_slash_direction()

    def _determine_slash_direction(self):
        if not self.accel_buffer:
            return 'NONE'
        avg_x = sum(self.accel_buffer) / len(self.accel_buffer)
        avg_y = sum(self.gyro_buffer) / len(self.gyro_buffer) if self.gyro_buffer else 0
        if abs(avg_x) > abs(avg_y):
            return 'LEFT' if avg_x < 0 else 'RIGHT'
        else:
            return 'UP' if avg_y < 0 else 'DOWN'

    def map(self, accelerometer, gyroscope):
        """
        Map phone sensor data to sword position and rotation.

        Args:
            accelerometer: {'x': float, 'y': float, 'z': float}
            gyroscope: {'x': float, 'y': float, 'z': float}

        Returns:
            {
                'sword_position': {'x': float, 'y': float},
                'sword_rotation': {'z': float},
                'motion_magnitude': float,
                'is_slashing': bool,
                'slash_direction': str,
                'calibrated': bool,
            }
        """
        accel_x = accelerometer.get('x', 0)
        accel_y = accelerometer.get('y', 0)
        accel_z = accelerometer.get('z', 0)
        gyro_x = gyroscope.get('x', 0)
        gyro_y = gyroscope.get('y', 0)
        gyro_z = gyroscope.get('z', 0)

        if self.is_calibrated:
            accel_x -= self.calibration_offset['x']
            accel_y -= self.calibration_offset['y']
            accel_z -= self.calibration_offset['z']
            gyro_x -= self.calibration_offset.get('gx', 0)
            gyro_y -= self.calibration_offset.get('gy', 0)
            gyro_z -= self.calibration_offset.get('gz', 0)

        accel_x = self._apply_deadzone(accel_x)
        accel_y = self._apply_deadzone(accel_y)
        accel_z = self._apply_deadzone(accel_z)
        gyro_x = self._apply_deadzone(gyro_x)
        gyro_y = self._apply_deadzone(gyro_y)
        gyro_z = self._apply_deadzone(gyro_z)

        smoothed_accel_x = self._smooth(accel_x, self.accel_buffer)
        smoothed_accel_y = self._smooth(accel_y, self.accel_buffer)
        smoothed_gyro_z = self._smooth(gyro_z, self.gyro_buffer)

        magnitude = self._calculate_magnitude(accel_x, accel_y, accel_z)
        self.motion_magnitude = magnitude

        sensitivity = self.config['sensitivity'] / 7.0
        smoothing = self.config['smoothing'] / 5.0

        sword_x = self._clamp(smoothed_accel_x * sensitivity * 0.5, -self.config['max_x'], self.config['max_x'])
        sword_y = self._clamp(-smoothed_accel_y * sensitivity * 0.5, -self.config['max_y'], self.config['max_y'])

        sword_rot_z = self._clamp(smoothed_gyro_z * self.config['rotation_sensitivity'] / 100.0, -90, 90)

        self.current_sword_pos = {'x': sword_x, 'y': sword_y}
        self.current_sword_rot = {'z': sword_rot_z}

        is_slashing, direction = self._detect_slash(magnitude)
        self.is_slashing = is_slashing
        self.slash_direction = direction

        return {
            'sword_position': self.current_sword_pos,
            'sword_rotation': self.current_sword_rot,
            'motion_magnitude': round(magnitude, 3),
            'is_slashing': is_slashing,
            'slash_direction': direction,
            'calibrated': self.is_calibrated,
            'timestamp': time.time(),
        }

    def get_state(self):
        return {
            'is_calibrated': self.is_calibrated,
            'motion_magnitude': self.motion_magnitude,
            'is_slashing': self.is_slashing,
            'slash_direction': self.slash_direction,
            'sword_position': self.current_sword_pos,
            'sword_rotation': self.current_sword_rot,
        }

    def update_config(self, config):
        for key, value in config.items():
            if key in self.config:
                self.config[key] = value
        self.accel_buffer = deque(maxlen=self.config['filter_window'])
        self.gyro_buffer = deque(maxlen=self.config['filter_window'])
