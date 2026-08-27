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

## 2. Laptop Game Design

### Network Manager
Runs the WebSocket server and receives controller messages.

### Motion Mapper
Converts phone movement data into 3D sword position, rotation, and slash direction.

### Game Manager
Controls the main game state and game loop.

### Object Manager
Maintains 3D fruit models, sliced fruit pieces, bombs, and other game objects.

### Collision Manager
Checks whether the sword slash intersects with game objects in 3D space.

### Effects Manager
Handles the slash trail, fruit-split animation, juice particles, and explosion effects.

### Score Manager
Calculates points, combos, penalties, and high scores.

### Audio Manager
Controls sound effects and background music.

### UI Manager
Displays menus, score, combo, timer, and game-over information.

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
