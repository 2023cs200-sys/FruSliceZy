# Testing Plan

## 1. Testing Objectives

The goal is to verify that the smartphone controller, network communication, motion detection, and game mechanics work together correctly.

## 2. Unit Testing

Individual modules should be tested separately.

### Mobile
- Motion calculations
- Calibration
- Message creation
- Connection handling

### Python
- Collision detection in 3D space
- Score calculation
- Combo calculation
- 3D fruit spawning and trajectories
- Sliced fruit piece creation
- Difficulty calculation
- Message parsing
- Motion-to-sword mapping

## 3. Integration Testing

Test communication between:

```text
React Native → WebSocket → Python
```

Verify that sensor data received by the laptop produces the expected game movement.

## 4. Functional Testing

Test:

- Controller connection
- Calibration
- Fruit cutting
- Bomb detection
- Score updates
- Combo updates
- Pause
- Game over
- High-score saving

## 5. Network Testing

Test:

- Same Wi-Fi network
- Wrong IP address
- Laptop unavailable
- Controller disconnect
- Reconnection
- Temporary network interruption

## 6. Performance Testing

Measure:

- Sensor update frequency
- Network latency
- 3D rendering frame rate
- Model and texture loading time
- CPU usage
- Memory usage
- GPU usage

## 7. Usability Testing

Ask users to perform:

1. Connect controller.
2. Calibrate.
3. Start game.
4. Cut fruits.
5. Avoid bombs.
6. View results.

Observe whether instructions are understandable.

## 8. Acceptance Criteria

The project is considered successful when:

- The phone connects reliably.
- Motion data reaches the laptop.
- Sword slashes respond to intentional movements.
- Fruits can be cut.
- Bombs can be detected.
- Scores and combos work.
- Difficulty increases.
- The game remains playable without crashes.
