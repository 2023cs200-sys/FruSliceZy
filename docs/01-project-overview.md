# FruSliceZy — Project Overview

## 1. Introduction

FruSliceZy is a motion-controlled 3D fruit-cutting game in which a smartphone is used as a wireless game controller. The player moves the smartphone like a sword, while the phone's accelerometer and gyroscope detect movement and rotation.

The detected motion is transmitted over a local Wi-Fi network to a laptop running the game. The Python/Ursina game converts the received motion into a virtual 3D sword slash that cuts 3D fruit models on the screen.

## 2. Project Goal

The main goal is to create an interactive game that combines mobile sensor technology, real-time wireless communication, and desktop game development.

## 3. Main Features

- Smartphone-based motion controller
- Accelerometer and gyroscope input
- Real-time Wi-Fi communication
- WebSocket-based communication
- 3D game scene rendered with the Ursina engine
- 3D fruit and bomb models
- Virtual 3D sword movement with slash trail
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

### Laptop Game
- Python
- Ursina engine (built on Panda3D)
- WebSocket server
- 3D models (`.obj`, `.glb`/`.gltf`) and textures
- JSON-based local data storage

## 5. Target Platform

- Android smartphone for the controller
- Windows/Linux/macOS laptop for the game
- Both devices connected to the same Wi-Fi network

## 6. Project Scope

The project focuses on local multiplayer-style interaction between one smartphone controller and one laptop game. Internet access is not required during gameplay.
