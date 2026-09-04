# Future Enhancements

## 1. Multiplayer

Support multiple smartphones as controllers for competitive or cooperative gameplay.

## 2. Online Leaderboard

Add a cloud-based leaderboard so players can compare scores.

## 3. Bluetooth Support

Add Bluetooth communication as an alternative to Wi-Fi.

## 4. Advanced Motion Recognition

Use machine learning to recognize different sword gestures such as:

- Horizontal slash
- Vertical slash
- Diagonal slash
- Spin attack

## 5. Power-Ups

Add special objects such as:

- Score multiplier
- Slow motion
- Shield
- Freeze time
- Extra life

## 6. More Game Modes

Possible modes:

- Classic
- Timed
- Endless
- Challenge
- Survival

## 7. Customization

Allow players to customize:

- Sword appearance
- Background
- Fruit themes
- Sound effects
- Difficulty

## 8. Better Visual Effects

Add:

- Slash trails
- Fruit splitting animations
- Particle effects
- Screen shake
- Combo animations

## 9. Player Profiles

Store player names, statistics, achievements, and gameplay history.

## 10. Mobile Game Statistics

Display controller statistics such as:

- Number of slashes
- Average slash speed
- Accuracy
- Fastest slash
- Total play time

## 11. Cross-Platform Support

Expand support for additional mobile devices and desktop platforms.

## 12. Future Vision

The long-term goal could be to turn FruSliceZy into a more immersive motion-controlled gaming platform where smartphones can act as flexible physical controllers for different games.

## Priority Status

The browser prototype already includes slicing visuals, slash trails,
particles, screen shake, combos, bombs, settings, and session high scores.
Those items are not future work for that package.

The highest-priority unfinished work is:

1. Implement Expo sensor subscriptions, calibration, and controller UI.
2. Define and validate the motion WebSocket protocol.
3. Bind the Python server for safe LAN use and connect motion to the sword.
4. Repair missing Python modules and complete the desktop Ursina runtime.
5. Add real fruit/bomb assets, persistence, dynamic difficulty, and automated
	mobile/protocol/end-to-end tests.

Optional future work includes power-ups, additional game modes, profiles,
leaderboards, Bluetooth, advanced gesture recognition, and multiplayer.
