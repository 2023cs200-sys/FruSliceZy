# FruSliceZy — Project Overview

## 1. Introduction

FruSliceZy is a motion-controlled fruit-cutting game in which a smartphone is
used as a wireless game controller. The selected production architecture uses
the browser as the game host; the player moves the smartphone like a sword,
while the phone's accelerometer and gyroscope detect movement and rotation.

The detected motion is transmitted over a local Wi-Fi network to the
Python WebSocket backend. The backend relays controller messages to the
browser game, which converts them into virtual sword slashes.

## 2. Project Goal

The main goal is to create an interactive game that combines mobile sensor technology, real-time wireless communication, and desktop game development.

## 3. Main Features

- Smartphone-based motion controller
- Accelerometer and gyroscope input
- Real-time Wi-Fi communication
- WebSocket-based communication
- Browser game scene rendered on a 2D canvas
- Fruit and bomb gameplay with visual effects
- Virtual sword movement with slash trail
- Fruit cutting that splits fruits into two pieces
- Collision detection in 3D space
- Bomb obstacles
- Score system
- Combo system
- Sound effects and particle effects
- Increasing game difficulty
- High-score tracking
- Controller calibration

## 4. Technology Stack

### Mobile Controller
- React Native
- Expo Go
- JavaScript
- Expo Sensors
- WebSocket

### Browser Game
- React and Vite
- 2D canvas rendering
- Mouse/touch input and phone motion control

### Python Backend
- Python
- WebSocket server
- Message relay between the phone and browser

## 5. Target Platform

- Android smartphone for the controller
- Windows/Linux/macOS laptop for the game
- Both devices connected to the same Wi-Fi network

## 6. Project Scope

The project focuses on interaction between one smartphone controller and one
browser game running on a laptop. Internet access is not required during
gameplay once the applications are available locally.

## Current Implementation Status

The browser prototype in `game-ui` is the primary playable
application. It is a 2D React/Vite canvas game controlled by mouse or touch.

The Expo app in `mobile-controller` provides connection, controller, sensor,
calibration, and WebSocket flows. The Python project provides the WebSocket
relay and motion mapper; it is not an end-to-end desktop renderer. The
browser owns gameplay and supports both mouse/touch and phone-controller play.
Ursina and Python 3D rendering are not required.
