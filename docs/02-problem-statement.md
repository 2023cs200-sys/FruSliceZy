# Problem Statement

## 1. Background

Traditional computer games generally depend on keyboards, mice, or conventional game controllers. These input methods can limit physical interaction and may make simple games feel less immersive.

Modern smartphones contain sensors such as accelerometers and gyroscopes that can detect physical movement. These sensors can be used as an alternative game-control mechanism.

## 2. Problem

There is a need for a simple and interactive game that uses the natural physical movement of a smartphone as its controller while maintaining real-time communication with a computer.

The challenge is to accurately detect meaningful sword-like movements, transmit sensor information with low delay, and convert the movement into useful game actions.

## 3. Proposed Solution

FruSliceZy proposes a React Native mobile application as a wireless motion
controller and a React/Vite browser application as the game engine and UI. A
Python/Ursina 3D version is optional experimentation, not the primary product.

The smartphone will collect motion data and send it to the browser game through
a local Wi-Fi WebSocket connection. The browser will process the data, render
the game, and generate virtual sword slashes.

## 4. Expected Outcome

The final system should allow a player to:

1. Connect the smartphone to the laptop.
2. Calibrate the controller.
3. Move the phone naturally like a sword.
4. Cut virtual fruits using detected motion.
5. Avoid bombs.
6. See cut fruits split into pieces.
7. Earn points and build combos.
8. Experience progressively increasing difficulty.

The browser prototype already provides the game UI and local mouse/touch
gameplay. Mobile motion control and browser-facing networking are proposed
extensions to that prototype.

## Implementation Note

This document defines the problem and proposed outcome. The complete outcome
is not delivered yet. The current runnable experience is the standalone
browser prototype, while phone sensors, LAN communication, Python 3D
rendering, and progressive difficulty remain planned or incomplete.
