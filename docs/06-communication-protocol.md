# Communication Protocol

## 1. Overview

The mobile controller and browser game will communicate using WebSockets over
a local Wi-Fi network.

The mobile application and browser game will be clients of the Python
WebSocket backend. The backend relays messages and does not own game state or
rendering.

## 2. Connection

The user enters the laptop's local IP address in the mobile application.

Example:

```text
ws://192.168.1.10:8765
```

The backend listens on `0.0.0.0:8765`. Clients on the same network connect to
`ws://<LAPTOP_IP>:8765`.

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

### Client Status

```json
{
  "type": "status",
  "status": "ready",
  "role": "controller"
}
```

The browser sends `"role": "browser"`. Explicit roles allow the server to
relay motion to the browser and game-state messages to the controller.

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

## Python Backend Contract

The Python backend listens on `ws://0.0.0.0:8765` and supports one controller
and one browser client. It validates JSON and sensor axes, maps motion through
`MotionMapper`, relays motion to the browser, and acknowledges handled
messages. It also relays browser game-state messages to the controller.
