# 3D Game Design

## 1. Overview

FruSliceZy is rendered as a 3D Fruit Ninja-style scene. Instead of flat 2D sprites, the game displays 3D fruit models that are launched into the air, cut into pieces by a virtual sword, and fall back down.

The game uses the Ursina engine, a Python game engine built on top of Panda3D.

## 2. Engine Choice

The Python game uses Ursina instead of Pygame.

Reasons:

- Ursina is written for Python and integrates naturally with the rest of the game code.
- It provides an entity-based scene graph for 3D objects, cameras, and lighting.
- It supports 3D models, textures, and simple per-frame updates suitable for motion-driven gameplay.
- It includes basic UI elements for menus and HUD text.

Ursina can load `.obj` models directly. Additional formats such as `.glb`/`.gltf` can be loaded through Panda3D's glTF loader support.

## 3. Scene Layout

```text
                     Camera
                        |
                        v
        +-------------------------------+
        |         3D Arena              |
        |                               |
        |      🍉        🍌             |
        |            ⚔️                 |
        |   🍎               🍍         |
        |            💣                 |
        +-------------------------------+
```

- The camera is fixed and looks at the play area.
- Fruits are launched from the bottom of the screen into the air.
- The sword moves on a plane between the camera and the falling objects.
- The arena/background surrounds the play area.

## 4. Coordinate System and Motion Mapping

Phone movement is mapped to the sword plane:

```text
Phone movement (accelerometer)
        ↓
Motion Mapper
        ↓
X / Y position on the sword plane (3D world coordinates)

Phone rotation (gyroscope)
        ↓
Sword rotation and slash orientation
```

The sword position is constrained to a fixed play plane so the player's real movement always corresponds to a visible sword position.

## 5. Game Objects

### Fruits

Each fruit is a 3D entity:

- 3D mesh loaded from `assets/models/fruits/<name>/`
- Spawned below the visible area with an upward velocity
- Follows a parabolic arc (velocity + simulated gravity)
- Rotates slowly while in the air
- Removed when it falls below the play area

### Bombs

Bombs behave like fruits but trigger a penalty, combo reset, and an explosion effect when cut.

### Sliced Fruit Pieces

When a fruit is cut, the whole fruit model is removed and replaced with two half models.

```text
       🍉
       ↓
      ⚔️
     ↙  ↘
   🍉    🍉
```

The two halves:

- Fly apart in the direction of the slash
- Fall under gravity
- Are removed after leaving the play area

Sliced models are stored next to the whole fruit model in the asset folders.

## 6. Sword and Slash

- The sword entity follows the mapped 3D position.
- The sword rotates according to the slash direction.
- A slash trail (fading segments behind the sword tip) visualizes the movement.
- A slash is registered when the sword moves fast enough and its swept path intersects an object.

## 7. Collision Detection

Collision checks are performed in 3D space:

- Each fruit and bomb uses a sphere collider.
- The sword's movement between frames is treated as a line segment.
- A hit is registered when the segment comes within the collider radius of an object.
- Only fast movements count as slashes, preventing accidental touches.

## 8. Visual Effects

- Fruit juice particles on cut
- Bomb explosion effect
- Slash trail behind the sword
- Combo text popup
- Screen feedback when a bomb is hit

## 9. Asset Organization

```text
assets/
├── models/
│   ├── fruits/          # one folder per fruit (whole + sliced halves)
│   ├── bombs/           # bomb models
│   ├── sword/           # sword model
│   └── effects/         # explosion/effect models
├── textures/
│   ├── fruits/          # fruit textures
│   ├── environments/    # arena textures
│   └── ui/              # menu/HUD textures
├── backgrounds/
│   ├── arena/           # in-game background assets
│   └── menu/            # menu background assets
├── sounds/
│   ├── sword/
│   ├── fruits/
│   ├── bombs/
│   ├── ui/
│   └── music/
└── fonts/
```

## 10. Performance Considerations

- Use low-poly models for fruits and bombs.
- Limit the number of objects in the air at the same time.
- Reuse and destroy entities properly to avoid memory leaks.
- Keep textures small and compressed.
- Monitor frame rate on the target laptop.

## 11. Development Phases

The 3D game should be built incrementally:

### Phase 1 — 3D Game Without Phone

- Ursina scene and camera
- Fruit spawning with arcs
- Keyboard/mouse-controlled sword
- Collision and scoring

### Phase 2 — WebSocket

- Python WebSocket server
- Simple motion messages from any client

### Phase 3 — Phone Sensors

- Accelerometer and gyroscope reading
- Motion detection and calibration

### Phase 4 — Connect Motion to Sword

- Receive phone motion
- Map motion to sword position and rotation

### Phase 5 — Fruit Slicing

- Cut detection
- Replace fruit with sliced halves
- Score, effects, sounds

### Phase 6 — Polish

- 3D environment and arena
- Particle effects and juice
- Sword trail
- Combo system
- Increasing difficulty
- Bombs
- High scores
- Pause menu and settings
