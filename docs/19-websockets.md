# WebSockets in FruSliceZy

## 1. What WebSockets Are

WebSockets provide persistent, full-duplex communication between a client and a server over one TCP connection. After the initial HTTP handshake, either side can send messages at any time without creating a new HTTP request for every message.

This is useful for FruSliceZy because the phone continuously produces motion data and the browser needs to receive that data with low latency while the game can send state or control messages back to the phone.

### Main characteristics

- Persistent connection
- Bidirectional communication
- Low message overhead after connection setup
- Event-driven message handling
- Text or binary frames
- Explicit connection lifecycle and close codes

WebSockets do not automatically provide application concepts such as users, rooms, authentication, message schemas, retries, or game state. Those responsibilities belong to the application.

## 2. How a WebSocket Connection Works

### 2.1 HTTP upgrade handshake

A WebSocket connection starts as an HTTP request containing an upgrade request. Conceptually, the client asks the server to change protocols:

```http
GET / HTTP/1.1
Host: 192.168.1.10:8765
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: <random-key>
Sec-WebSocket-Version: 13
```

A compatible server responds with `101 Switching Protocols`:

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: <computed-value>
```

After the response, the connection is no longer used as ordinary HTTP. Both endpoints exchange WebSocket frames over the same connection.

For FruSliceZy, clients connect to the Python backend using a URL such as:

```text
ws://192.168.1.10:8765
```

The server listens on `0.0.0.0:8765`, which allows devices on the same local Wi-Fi network to connect through the laptop's local IP address.

### 2.2 Communication

Once connected, the client and server can send messages independently. FruSliceZy uses JSON text messages because they are easy to inspect and parse across Python, React, and React Native.

A message is sent as one or more WebSocket frames. The protocol handles framing, masking, ping/pong control frames, and close frames. The application only needs to define the JSON message contract and how each message type is handled.

### 2.3 Closing the connection

A normal close uses a closing handshake:

1. One endpoint sends a close frame with a status code and optional reason.
2. The other endpoint responds with a close frame.
3. Both endpoints release the connection.

The browser and mobile clients use close code `1000` for an intentional disconnect. Unexpected network loss is handled by the client's reconnect logic.

Common close codes include:

| Code | Meaning |
| --- | --- |
| `1000` | Normal closure |
| `1001` | Endpoint is going away |
| `1002` | Protocol error |
| `1003` | Unsupported data type |
| `1008` | Policy violation |
| `1011` | Unexpected server condition |

## 3. FruSliceZy WebSocket Architecture

The selected architecture has three parts:

```text
Phone sensors
    |
    | motion, calibration, status, ping
    v
Python WebSocket backend
    |
    | relayed motion and calibration messages
    v
Browser game
```

The Python backend is a relay and motion-processing boundary. It does not render the game. The browser owns the game interface, gameplay state, fruit collision, score, combo, effects, and sound.

### Client roles

Each JavaScript client explicitly identifies its role in the initial ready
status message:

- `CONTROLLER`: normally the mobile controller that sends motion data.
- `BROWSER`: normally the game browser that sends game-state messages.
- `UNKNOWN`: a newly connected client before its first identifying message.

The current server tracks one controller client and one browser client. A later multiplayer design could replace these single references with room membership or multiple client groups.

### Current implementation locations

- Python server: `python-game/src/networking/websocket_server.py`
- Browser hook: `motion-fruit-cutter/src/hooks/useWebSocket.js`
- Mobile hook: `mobile-controller/src/hooks/useWebSocket.js`
- Mobile connection manager: `mobile-controller/src/networking/connectionManager.js`
- Shared protocol documentation: `docs/06-communication-protocol.md`

## 4. Message Format

Every application message is a JSON object with a string `type` field. Examples below show the messages currently supported by the Python server and clients.

### 4.1 Connection status

The server sends this message immediately after accepting a connection:

```json
{
  "type": "connection",
  "status": "connected",
  "client_id": "a1b2c3d4"
}
```

When a peer disconnects, the server may notify the remaining client:

```json
{
  "type": "connection",
  "status": "peer_disconnected",
  "peer_role": "controller"
}
```

### 4.2 Controller status

A client sends `ready` after opening its connection:

```json
{
  "type": "status",
  "status": "ready",
  "role": "controller"
}
```

The browser sends the same message with `"role": "browser"`. The server uses
the role to register the correct peer before motion or game-state messages
arrive. A status message without a role retains the legacy controller default.

### 4.3 Motion message

The mobile controller sends accelerometer and gyroscope readings:

```json
{
  "type": "motion",
  "timestamp": 1724678900,
  "accelerometer": {
    "x": 1.2,
    "y": -0.5,
    "z": 0.8
  },
  "gyroscope": {
    "x": 0.2,
    "y": 1.5,
    "z": -0.3
  }
}
```

The server validates the three axes, maps the motion to sword data, and relays the enriched message to the browser:

```json
{
  "type": "motion",
  "timestamp": 1724678900,
  "accelerometer": {
    "x": 1.2,
    "y": -0.5,
    "z": 0.8
  },
  "gyroscope": {
    "x": 0.2,
    "y": 1.5,
    "z": -0.3
  },
  "sword_position": { "x": 0.0, "y": 0.0 },
  "sword_rotation": { "z": 0.0 },
  "motion_magnitude": 3.2,
  "is_slashing": false,
  "slash_direction": "NONE",
  "calibrated": true
}
```

The exact mapped values are produced by `MotionMapper` and may change as the game tuning evolves.

### 4.4 Calibration message

The client can request calibration:

```json
{
  "type": "calibrate",
  "accelerometer": {
    "x": 0.01,
    "y": -0.02,
    "z": 9.81
  }
}
```

The accelerometer object is optional in the current server. When present, it updates the motion mapper calibration offset. The browser receives a calibration notification:

```json
{
  "type": "calibrate",
  "calibrated": true
}
```

### 4.5 Tuning message

Motion behavior can be adjusted by sending a configuration object:

```json
{
  "type": "tuning",
  "config": {
    "sensitivity": 7.0,
    "smoothing": 5.0,
    "motion_threshold": 2.5,
    "slash_threshold": 1.5,
    "sword_speed": 15.0,
    "rotation_sensitivity": 45.0
  }
}
```

Unknown tuning keys are ignored by the current server. Values are converted to floating-point numbers before being applied.

### 4.6 Ping message

A client can send an application-level ping:

```json
{
  "type": "ping"
}
```

The server responds with an acknowledgement. WebSocket implementations also support protocol-level ping/pong frames, but this application message is useful for checking that the FruSliceZy message path is alive.

### 4.7 Game-state message

The browser can send game state to the backend:

```json
{
  "type": "game",
  "state": {
    "score": 120,
    "combo": 4,
    "time_left": 42.5,
    "fruits": []
  }
}
```

The server marks the sender as the browser and relays this message to the controller when one is connected.

### 4.8 Acknowledgement

For messages handled by the server, the sender receives an acknowledgement:

```json
{
  "type": "ack",
  "original_type": "motion",
  "timestamp": 1724678900
}
```

An acknowledgement confirms that the server processed the message. It does not mean that the browser has finished using the data.

### 4.9 Error

Invalid input produces an error message instead of crashing the connection:

```json
{
  "type": "error",
  "message": "Invalid sensor data: values must be numeric",
  "timestamp": 1724678900
}
```

The server rejects malformed JSON, non-object JSON messages, missing or invalid `type` values, missing motion fields, and invalid sensor axes.

## 5. Backend Message Flow

The Python server follows this general flow:

1. Accept a WebSocket connection.
2. Create a client record with a generated short ID.
3. Send a `connection` message.
4. Read messages until the socket closes.
5. Parse and validate each JSON message.
6. Dispatch by `type`.
7. Register explicit `controller` or `browser` roles from ready status.
8. Process motion or calibration data when needed.
9. Relay relevant data to the peer client.
10. Send an `ack` or `error` response.
11. Remove the client and notify the remaining peer on disconnect.

The server uses the `websockets` Python package and asynchronous functions so multiple clients can be served without blocking the event loop during network operations.

Start it with:

```powershell
cd python-game
python -m venv venv
venv\\Scripts\\activate
python -m pip install -r requirements.txt
python main.py
```

The server prints its listening address:

```text
WebSocket server starting on ws://0.0.0.0:8765
```

## 6. Client Connection Behavior

Both JavaScript clients expose a WebSocket hook. Their common behavior is:

- Create a WebSocket using the configured URL.
- Set status to `connecting`.
- Set status to `connected` after the open event.
- Send `{ "type": "status", "status": "ready", "role": "controller" }` or
  the equivalent browser role.
- Parse incoming JSON messages.
- Route messages to motion, game-state, error, or connection callbacks.
- Queue outgoing messages while disconnected.
- Flush queued messages after reconnecting.
- Retry after an unexpected close.
- Stop retrying after the configured maximum number of attempts.
- Close with code `1000` for an intentional disconnect.

The default reconnect interval is 3 seconds. The clients increase the delay for later attempts up to five times the configured interval, and the default maximum is 10 attempts.

A connection URL must contain a host and port, for example:

```text
ws://192.168.1.10:8765
```

`localhost` works when the client and server run on the same machine. A phone must use the laptop's LAN IP address, not `localhost`, because `localhost` on the phone refers to the phone itself.

## 7. WebSocket Rooms and FruSliceZy Roles

WebSockets alone do not define rooms. A room is an application-level collection of connected clients used for targeted broadcasting.

A simple room implementation stores sets of clients:

```javascript
const rooms = new Map();

function joinRoom(roomName, client) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(client);
}

async function broadcast(roomName, message) {
  const members = rooms.get(roomName) || [];
  const payload = JSON.stringify(message);

  for (const client of members) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
}
```

FruSliceZy currently uses a smaller role-based arrangement instead of general rooms:

```text
controller client <-> Python relay <-> browser client
```

The `controller_client` and `browser_client` references act like two fixed logical channels. A future multiplayer version could introduce room messages such as `join_room`, maintain a set of clients per game session, and broadcast motion or game events only to members of the same room.

Room membership should be cleaned up whenever a client disconnects. Broadcast code should also handle closed sockets so one failed client does not prevent delivery to the rest of the room.

## 8. Validation and Reliability Rules

The server and clients should follow these rules:

- Treat all incoming data as untrusted.
- Parse JSON inside an exception handler.
- Require a string `type` field.
- Validate required fields for each message type.
- Validate that sensor axes are numeric and within an acceptable range.
- Reject or ignore unknown message types consistently.
- Avoid blocking work inside the asynchronous message handler.
- Handle `ConnectionClosed` exceptions during reads and sends.
- Remove disconnected clients from all role or room registries.
- Do not assume that an acknowledgement means end-to-end game processing is complete.
- Bound message size and message frequency in a production deployment.
- Use authentication and authorization before exposing the server beyond a trusted local network.

The current server validates the basic JSON shape and sensor values. It is still a prototype contract: timestamps and tuning values need stronger validation, and production deployments should add authentication, rate limiting, structured logging, and explicit protocol versioning.

## 9. Security Considerations

The development setup uses unencrypted `ws://` on a local network. For an untrusted network or production deployment, use:

- `wss://` with TLS certificates
- Authentication during or immediately after connection
- Authorization for controller and browser roles
- Origin and host validation where appropriate
- Input size and rate limits
- Server-side validation of every message
- Logs that avoid recording sensitive sensor data unnecessarily
- A reverse proxy or firewall rule limiting access to the intended clients

Encryption protects data in transit, but it does not replace validation or authorization.

## 10. Testing Checklist

### Connection tests

- Start the Python server on port `8765`.
- Connect one browser client.
- Connect one mobile client using the laptop LAN IP.
- Confirm both clients receive `connection` status.
- Confirm each client sends a `ready` status.
- Disconnect one peer and confirm the other receives `peer_disconnected`.
- Reconnect after a temporary network failure.
- Confirm intentional close uses normal close behavior.

### Message tests

- Send valid motion data and confirm an `ack` plus browser relay.
- Send motion data with a missing accelerometer axis and expect an error.
- Send motion data with a non-numeric value and expect an error.
- Send malformed JSON and confirm the server remains running.
- Send an unknown message type and confirm an error response.
- Send calibration data and confirm the mapper updates.
- Send tuning data and confirm accepted values are applied.
- Send a ping and confirm an acknowledgement.
- Send game state and confirm the controller receives it.

### Network tests

- Test on the same machine with `ws://localhost:8765`.
- Test from a phone on the same Wi-Fi network.
- Confirm the firewall permits inbound TCP traffic on port `8765`.
- Confirm the phone does not use `localhost` for the laptop server.
- Observe behavior when Wi-Fi is disabled and restored.

## 11. Current Project Status

The Python WebSocket backend and client connection helpers implement the core
relay path. The browser supports local mouse/touch gameplay and phone-controller
gameplay through the browser WebSocket client. Controller mode is selected from
the Play or How To Play flow and includes connection and calibration steps.

The protocol should therefore be treated as an evolving development contract. When message fields or roles change, update the server, mobile client, browser client, tests, and protocol documentation together.

## 12. Summary

WebSockets give FruSliceZy the persistent, low-latency connection needed to move phone sensor data into the browser game. The current design uses:

- Python `websockets` as the backend server
- JSON text messages as the application protocol
- A mobile controller role for sensor and calibration data
- A browser role for game state
- The Python backend as a relay and motion-processing boundary
- Acknowledgements and errors for message-level feedback
- Client-side queues and reconnect attempts for temporary network failures
- Role references today, with room-based broadcasting available as a future multiplayer extension
