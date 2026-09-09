# Game Mechanics

## 1. Core Gameplay

The player uses the smartphone as a virtual sword.

3D fruits are launched into the air on the laptop screen. The player moves the phone to create sword slashes and cut the fruits, which split into two pieces.

## 2. Fruits

Each fruit provides points when successfully cut.

Example scoring:

| Fruit | Base Points |
|---|---:|
| Apple | 10 |
| Banana | 15 |
| Orange | 10 |
| Watermelon | 25 |
| Pineapple | 20 |

The exact values can be adjusted during balancing.

When a fruit is cut, its 3D model is replaced with two sliced half models that fly apart, fall down, and disappear. A juice particle effect is played at the cut position.

## 3. Bombs

Bombs are dangerous objects.

If the virtual sword hits a bomb:

- The player receives a penalty.
- The current combo can be reset.
- A bomb sound effect is played.

The exact penalty can be configured.

## 4. Combo System

Consecutive fruit cuts increase the combo.

Example:

```text
1st fruit → 10 points
2nd fruit → 10 points
3rd fruit → 10 points
Combo → x3
```

A combo multiplier can increase the score for consecutive successful cuts.

## 5. Difficulty

Difficulty increases gradually during gameplay.

Possible changes include:

- Faster object movement
- More objects
- More frequent bombs
- Reduced reaction time
- More complex spawn patterns

## 6. Game Timer

A game round can use a fixed time limit, such as 60 seconds.

The timer decreases while the game is active.

## 7. Game Over

The game ends when:

- The timer reaches zero, or
- The player reaches a configured loss condition.

The results screen displays:

- Final score
- Highest combo
- Fruits cut
- Bombs hit
- Difficulty reached

## 8. Pause

The player can pause the game.

During pause:

- Object movement stops.
- Score remains unchanged.
- Sensor actions do not trigger gameplay events.

## Implementation Status

The mechanics above are the target game design. The browser prototype
implements fruit and bomb spawning, slicing, split visuals, particles, a
60-second round, pause/game-over flow, combos, and in-memory session scores. In
that prototype, hitting a bomb subtracts 50 points and resets the current
combo; slices within roughly 400 ms build a combo.

The Python modules contain partial game and scoring foundations, but Python
bomb objects, dynamic difficulty, phone-driven slashes, and persistent scores
are not currently implemented end to end.
