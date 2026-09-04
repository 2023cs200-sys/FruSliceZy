# System Architecture

## 1. Overview

The selected system consists of two main applications:

1. Mobile Controller
2. Browser Game

The applications will communicate through a local Wi-Fi network using
WebSockets through a Python backend. The browser owns the game and UI; Python
only relays messages.

## 2. Architecture

```text
+-----------------------------+
|       Smartphone            |
|  React Native + Expo Go     |
|                             |
|  Accelerometer              |
|  Gyroscope                  |
|        |                    |
|        v                    |
|  Motion Detection           |
|        |                    |
|        v                    |
|  WebSocket Client           |
+-------------+---------------+
              |
              | Local Wi-Fi
              | WebSocket
              v
+-------------+---------------+
|          Laptop             |
|                             |
|  Python WebSocket Backend   |
|             |               |
|             v               |
|  Motion Mapper              |
|             |               |
|             v               |
|    React Canvas Game        |
|             |               |
|    +--------+--------+      |
|    |        |        |      |
| | 3D Fruits Bombs  Sword    |
|    |        |        |      |
|    +--------+--------+      |
|             |               |
|       Collision             |
|             |               |
|       Score / Combo         |
+-----------------------------+
```

## 3. Data Flow

```text
Phone Movement
      ↓
Accelerometer/Gyroscope
      ↓
Motion Processing
      ↓
JSON WebSocket Message
      ↓
Python WebSocket Backend
      ↓
Motion Mapper
      ↓
Canvas Sword Movement
      ↓
Canvas Collision Detection
      ↓
Slice / Score / Combo
      ↓
Game Result
```

## 4. Network Model

The smartphone and browser are WebSocket clients of the Python backend. The
backend listens on `0.0.0.0:8765` and relays valid JSON messages. The current
browser prototype still uses mouse/touch input only; client integration is
planned.

Both devices must be connected to the same local network.

## Current Versus Target Architecture

The diagram above is the target phone-controlled architecture. The current
browser architecture is simpler:

```text
React application -> canvas game loop -> pointer collision
                  -> fruit/bomb effects -> score, combo, and HUD
```

The Python backend accepts connections on `ws://0.0.0.0:8765` and does not run
an Ursina desktop game loop. It validates message shape and relays messages;
the browser remains responsible for game state and rendering.
