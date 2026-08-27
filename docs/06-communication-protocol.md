# Communication Protocol

## 1. Overview

The mobile controller and laptop game communicate using WebSockets over a local Wi-Fi network.

The mobile application is the client. The Python game is the server.

## 2. Connection

The user enters the laptop's local IP address in the mobile application.

Example:

```text
ws://192.168.1.10:8765
```

The port number can be configured in the Python game settings.

## 3. Message Format

Messages use JSON.

### Motion Message

```json
{
  "type": "motion",
  "timestamp": 1724678900,
  "accelerometer": {
    "x": 1.20,
    "y": -0.50,
    "z": 0.80
  },
  "gyroscope": {
    "x": 0.20,
    "y": 1.50,
    "z": -0.30
  }
}
```

### Calibration Message

```json
{
  "type": "calibrate"
}
```

### Ping Message

```json
{
  "type": "ping"
}
```

### Controller Status

```json
{
  "type": "status",
  "status": "ready"
}
```

## 4. Server Responses

The server may send messages such as:

```json
{
  "type": "connection",
  "status": "connected"
}
```

or:

```json
{
  "type": "game",
  "action": "start"
}
```

## 5. Error Handling

The server should:

- Reject malformed JSON.
- Ignore unknown message types.
- Validate numeric sensor values.
- Handle disconnected clients.
- Prevent invalid sensor data from crashing the game.

## 6. Communication Goals

The protocol should prioritize:

- Low latency
- Small message size
- Simple parsing
- Reliable connection handling
