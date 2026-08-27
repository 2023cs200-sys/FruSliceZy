# API / WebSocket Documentation

## 1. Overview

SliceRush does not require a traditional REST API. Communication between the mobile controller and laptop uses a WebSocket interface.

## 2. WebSocket Endpoint

```text
ws://<LAPTOP_IP>:<PORT>
```

Example:

```text
ws://192.168.1.10:8765
```

## 3. Client Messages

### `motion`

Sends current accelerometer and gyroscope readings.

```json
{
  "type": "motion",
  "timestamp": 1724678900,
  "accelerometer": {
    "x": 0.4,
    "y": -1.2,
    "z": 0.7
  },
  "gyroscope": {
    "x": 0.1,
    "y": 0.8,
    "z": -0.4
  }
}
```

### `calibrate`

Requests controller calibration.

```json
{
  "type": "calibrate"
}
```

### `ping`

Checks whether communication is active.

```json
{
  "type": "ping"
}
```

## 4. Server Messages

### `connection`

```json
{
  "type": "connection",
  "status": "connected"
}
```

### `game`

```json
{
  "type": "game",
  "action": "start"
}
```

## 5. Error Response

Example:

```json
{
  "type": "error",
  "message": "Invalid motion data"
}
```

## 6. Validation

The server should validate:

- Message type
- Required fields
- Numeric sensor values
- Timestamp format
- Reasonable sensor ranges

## 7. Versioning

A future version can add a protocol version field:

```json
{
  "version": "1.0",
  "type": "motion"
}
```
