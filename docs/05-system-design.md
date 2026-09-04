# System Design

## 1. Mobile Controller Design

The mobile application contains the following logical components:

### Sensor Manager
Reads accelerometer and gyroscope values.

### Motion Detector
Processes sensor values and determines whether a sword-like movement has occurred.

### Calibration Manager
Records the initial controller orientation and uses it as a reference.

### WebSocket Manager
Creates and maintains communication with the laptop.

### Controller UI
Displays connection status, calibration controls, motion status, and basic instructions.

## 2. Browser Game Design

### Browser Network Adapter
Will receive motion-controller messages and pass normalized events to the
browser game. This adapter is not implemented yet.

### Motion Mapper
Converts phone movement data into browser sword position, rotation, and slash
direction. This is a planned browser module.

### Game Manager
Controls the main game state and game loop in `motion-fruit-cutter/src/App.jsx`.

### Object Manager
Maintains canvas fruit, sliced pieces, bombs, and other game objects in
`ArcadeGameCanvas.jsx`.

### Collision Manager
Checks whether the pointer or future motion-driven sword intersects with game
objects in the canvas.

### Effects Manager
Handles the slash trail, fruit-split animation, juice particles, and explosion
effects in the canvas game.

### Score Manager
Calculates points, combos, penalties, and in-memory high scores in `App.jsx`.

### Audio Manager
Controls browser sound effects through `utils/sound.js`.

### UI Manager
Displays menus, score, combo, timer, and game-over information through the
React screen components and HUD.

## 3. Game States

```text
MAIN MENU
    |
    v
CONNECT CONTROLLER
    |
    v
CALIBRATION
    |
    v
READY
    |
    v
PLAYING
   /   /   PAUSE GAME OVER
          |
          v
       RESULTS
          |
          v
       PLAY AGAIN
```

## 4. Design Principles

- Separate mobile and desktop responsibilities.
- Keep networking independent from game logic.
- Use small modules with clear responsibilities.
- Validate incoming sensor messages.
- Avoid making the game dependent on a constant network connection.

## Implementation Mapping

The browser implementation is centered in
`motion-fruit-cutter/src/App.jsx` and
`motion-fruit-cutter/src/components/ArcadeGameCanvas.jsx`. The Python
foundation maps game orchestration to `src/game/game.py`, collision to
`src/collision/collision_detector.py`, sword movement to `src/player/`, and
score/combo logic to `src/scoring/`.

The mobile sensor, calibration, networking, audio-manager, and UI-manager
responsibilities in the design above are planned boundaries. The corresponding
mobile hooks/modules are currently empty or placeholder-only, and several
named Python UI/object modules do not exist yet.
