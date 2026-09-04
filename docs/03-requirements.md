# Requirements

## 1. Functional Requirements

### Mobile Controller

- The application shall display the controller connection interface.
- The application shall allow the user to enter the laptop IP address.
- The application shall establish a WebSocket connection.
- The application shall access accelerometer data.
- The application shall access gyroscope data.
- The application shall detect significant motion.
- The application shall support controller calibration.
- The application shall send motion data to the laptop.
- The application shall show connection status.

### Browser Game

- The game shall start a WebSocket server.
- The game shall accept a controller connection.
- The game shall receive motion messages.
- The game shall render the playable scene in the browser.
- The game shall map motion data to browser sword movement.
- The game shall spawn fruit and bomb visuals in the browser.
- The game shall detect sword/object collisions in the browser.
- The game shall split a cut fruit into two sliced pieces.
- The game shall increase the player's score when fruits are cut.
- The game shall maintain combo information.
- The game shall apply a penalty when a bomb is hit.
- The game shall increase difficulty over time.
- The game shall provide sound effects.
- The game shall display visual effects for slashes, cuts, and explosions.
- The game shall display game-over results.
- The game shall store high scores.

## 2. Non-Functional Requirements

### Performance
- Motion input should feel responsive.
- Network communication should have low latency.
- The game should maintain a stable frame rate.

### Usability
- The controller interface should be simple.
- Connection and calibration status should be clear.
- Instructions should be easy to understand.

### Reliability
- The system should handle controller disconnection gracefully.
- Invalid network messages should not crash the game.

### Maintainability
- Mobile and game code should be separated into logical modules.
- Documentation should be maintained alongside the project.

## 3. Hardware Requirements

- Android smartphone with accelerometer and gyroscope
- Laptop/desktop computer
- Wi-Fi router or mobile hotspot

## 4. Software Requirements

- Node.js and npm
- Expo CLI/Expo development environment
- Expo Go
- Python 3 is required for the WebSocket backend.
- Ursina is not required.
- A browser-compatible WebSocket host is required for future phone control.

## Requirement Status

The requirements describe the target system, not a completed implementation.

| Area | Current status |
| --- | --- |
| Browser fruit-cutting prototype | Implemented as a React/Vite 2D canvas game with mouse/touch input |
| Mobile routes and Expo shell | Partially implemented; connection and controller screens are placeholders |
| Mobile sensors, calibration, and WebSocket client | Planned; source modules are empty |
| Python game modules and unit tests | Partially implemented; missing imports currently block a complete runtime/test suite |
| Python WebSocket state server | Partially implemented on `localhost:8765`; incoming `slice` handling is a no-op |
| LAN phone control, 3D runtime, persistence, and dynamic difficulty | Not implemented |
