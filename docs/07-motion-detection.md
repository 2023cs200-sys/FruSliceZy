# Motion Detection

## 1. Overview

Motion detection is the core feature that transforms physical smartphone movement into a virtual sword slash.

The system uses accelerometer and gyroscope readings.

## 2. Accelerometer

The accelerometer measures acceleration along three axes:

- X-axis
- Y-axis
- Z-axis

A sudden change in acceleration can indicate a fast physical movement.

## 3. Gyroscope

The gyroscope measures rotational movement around the device axes.

It helps distinguish different phone orientations and movement directions.

## 4. Processing Pipeline

```text
Raw Sensor Data
       ↓
Noise Filtering
       ↓
Calibration
       ↓
Motion Magnitude
       ↓
Threshold Check
       ↓
Direction Detection
       ↓
Slash Event
```

## 5. Motion Magnitude

A simple acceleration magnitude can be calculated as:

```text
magnitude = sqrt(x² + y² + z²)
```

The system can compare this value with a configurable threshold.

If the movement exceeds the threshold for a short period, a slash event can be generated.

## 6. Slash Direction

The direction can be estimated from changes in sensor values.

Possible directions include:

- Left to right
- Right to left
- Upward
- Downward
- Diagonal

The exact mapping should be tuned through testing.

## 7. Calibration

Calibration allows the player to establish a neutral starting orientation.

The controller can collect several sensor samples while the player holds the phone still and calculate reference values.

## 8. Filtering

Sensor readings can contain noise. A moving average or similar lightweight filter can be used to smooth the values.

## 9. Tuning

The motion threshold should be configurable because different phones and users may produce different sensor values.

Testing should be performed with:

- Slow movements
- Fast movements
- Small movements
- Intentional sword slashes
- Phone rotation without a slash

## Implementation Status

This is the intended motion-processing design. The mobile sensor modules and
`useMotionSensors` hook currently contain no implementation, so no
accelerometer or gyroscope readings are processed and no slash events are
generated from a phone. The browser prototype uses pointer movement instead.
