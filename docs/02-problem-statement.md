# Problem Statement

## 1. Background

Traditional computer games generally depend on keyboards, mice, or conventional game controllers. These input methods can limit physical interaction and may make simple games feel less immersive.

Modern smartphones contain sensors such as accelerometers and gyroscopes that can detect physical movement. These sensors can be used as an alternative game-control mechanism.

## 2. Problem

There is a need for a simple and interactive game that uses the natural physical movement of a smartphone as its controller while maintaining real-time communication with a computer.

The challenge is to accurately detect meaningful sword-like movements, transmit sensor information with low delay, and convert the movement into useful game actions.

## 3. Proposed Solution

SliceRush addresses this problem by using a React Native mobile application as a wireless motion controller and a Python/Ursina application as a 3D game engine.

The smartphone collects motion data and sends it to the laptop through a local Wi-Fi WebSocket connection. The laptop processes the data, renders the 3D scene, and generates virtual sword slashes.

## 4. Expected Outcome

The final system should allow a player to:

1. Connect the smartphone to the laptop.
2. Calibrate the controller.
3. Move the phone naturally like a sword.
4. Cut 3D virtual fruits using detected motion.
5. Avoid bombs.
6. See cut fruits split into pieces.
7. Earn points and build combos.
8. Experience progressively increasing difficulty.
