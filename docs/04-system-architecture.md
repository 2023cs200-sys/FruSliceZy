# System Architecture

## 1. Overview

The selected system consists of two main applications:

1. Mobile Controller
2. Browser Game

The applications will communicate through a local Wi-Fi network using
WebSockets. The Python/Ursina project is optional and outside this primary
architecture.

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
|  Browser WebSocket Handler  |
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
Browser WebSocket Handler
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

The smartphone will act as the WebSocket client and the browser game will act
as the host and game runtime. The current browser prototype still uses
mouse/touch input only; this browser-facing connection is planned.

Both devices must be connected to the same local network.

## Current Versus Target Architecture

The diagram above is the target phone-controlled architecture. The current
browser architecture is simpler:

```text
React application -> canvas game loop -> pointer collision
                  -> fruit/bomb effects -> score, combo, and HUD
```

The optional Python server accepts a WebSocket on `ws://localhost:8765`, but it
is not used by the primary browser architecture. It does not yet receive
phone motion, bind to a LAN interface, or run the Ursina desktop game loop.
