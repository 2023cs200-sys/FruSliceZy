# FruSliceZy

FruSliceZy is the browser-playable arcade prototype for FruSliceZy.
It is the primary game host and presents the game loop and interface that will
be driven by the mobile motion controller.

## What Is Included

- Main menu, connection, calibration, how-to-play, pause, game-over, scores,
  and settings screens
- Canvas-based fruit and bomb spawning
- Mouse and touch blade input
- Fruit slicing with split pieces, juice, particles, and screen effects
- Combos, score tracking, bomb penalties, countdown timer, and high scores
- Sound effects and selectable blade/game settings

The current browser build simulates the controller locally. It does not yet
connect to the mobile controller or require a Python server.

## Run Locally

Prerequisite: Node.js and npm.

```powershell
npm install
npm run dev
```

Vite normally serves the app at `http://localhost:3000`. Use the URL printed
in the terminal if that port is already in use.

## Production Commands

```powershell
npm run build
npm run preview
```

## Source Layout

```text
src/
  App.jsx                         Application state and screen flow
  components/ArcadeGameCanvas.jsx Game simulation and canvas rendering
  components/HUD.jsx              In-game score, combo, and timer display
  components/screens/             Menus and game-state screens
  data/fruits.js                  Fruit, bomb, and blade configuration
  utils/sound.js                  Browser sound effects
```

## Controls

Start a game from the main menu, then drag or swipe across the play area to
slice fruit. Avoid bombs. A quick sequence of successful slices increases the
combo multiplier; hitting a bomb breaks the combo and reduces the score.

## Relationship To The Full Project

The phone controller is in `../mobile-controller`. The optional Python/Ursina
experiment is in `../python-game`, but it is not part of the production flow:

```text
Phone accelerometer/gyroscope -> WebSocket -> Browser game -> virtual sword
```

This package is currently a standalone browser prototype, so no environment
variables, API keys, Python installation, or Python WebSocket server are needed
to run it. The browser-facing WebSocket connection is planned.
