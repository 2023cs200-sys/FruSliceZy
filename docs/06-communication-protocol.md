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

## Python Backend Contract

The Python backend listens on `ws://0.0.0.0:8765`; it does not use the
documented configurable laptop IP/port flow. For each connected client it
sends messages shaped like:

```json
{
  "type": "state",
  "state": {
    "score": 0,
    "combo": 0,
    "time_left": 60.0,
    "fruits": []
  }
}
```

Incoming JSON is inspected for `type`. Only `slice` is recognized, and its
handler is currently a no-op. `motion`, `calibrate`, `ping`, and `status` are
planned messages, not implemented messages. Malformed JSON and missing fields
are not yet validated robustly, so this protocol must not be treated as a
production network contract.

## Selected Browser Protocol

The browser prototype currently has no WebSocket connection. The production
clients should connect to the Python backend, with motion messages relayed to
the browser and game state remaining inside the React application.
