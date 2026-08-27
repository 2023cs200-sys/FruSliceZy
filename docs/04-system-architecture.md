# System Architecture

## 1. Overview

The system consists of two main applications:

1. Mobile Controller
2. Laptop Game

The applications communicate through a local Wi-Fi network using WebSockets.

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
|  Python WebSocket Server    |
|             |               |
|             v               |
|  Motion Mapper              |
|             |               |
|             v               |
|     Ursina 3D Game          |
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
Python Server
      ↓
Motion Mapper
      ↓
3D Sword Movement
      ↓
Collision Detection (3D)
      ↓
Slice / Score / Combo
      ↓
Game Result
```

## 4. Network Model

The smartphone acts as the WebSocket client and the laptop acts as the WebSocket server.

Both devices must be connected to the same local network.
