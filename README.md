# FruSliceZy

FruSliceZy is a motion-controlled fruit-cutting game project. The selected
architecture uses a phone as a sword controller and the browser as the game
host. The repository also contains an optional Python/Ursina experiment, but
it is not required by the primary product.

## Project Parts

| Directory | Purpose | Technology |
| --- | --- | --- |
| `motion-fruit-cutter` | Primary game client with menus, HUD, fruit spawning, slicing, combos, bombs, effects, sound, and high scores | React, Vite |
| `mobile-controller` | Phone-only motion controller; sends sensor events to the browser game | React Native, Expo |
| `python-game` | Optional legacy 3D experiment and WebSocket server foundation; outside the primary runtime | Python, Ursina, websockets |
| `docs` | Requirements, architecture, protocol, design, testing, and operations documentation | Markdown |

## Quick Start: Browser Prototype

Prerequisite: Node.js and npm.

```powershell
cd motion-fruit-cutter
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:3000`.
The browser prototype uses mouse or touch input for slicing and does not need
an API key, a Python server, or a `.env.local` file. Phone control will use a
browser-facing WebSocket connection when the mobile integration is completed.

Other web commands:

```powershell
npm run build    # Create a production build
npm run preview  # Preview the production build locally
```

## Quick Start: Mobile Controller

Prerequisites: Node.js, npm, Expo tooling, and an Android or iOS device with
Expo Go for device testing.

```powershell
cd mobile-controller
npm install
npm start
```

Use the Expo CLI prompts or scan the QR code with Expo Go. The current app
provides the home, connection, controller, and settings routes. The
connection and controller screens are placeholders while the sensor and
WebSocket integration is being completed.

## Optional: Python/Ursina Experiment

Prerequisites: Python 3.10 or newer is recommended. The game dependencies are
listed in `python-game/requirements.txt`.

```powershell
cd python-game
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python main.py
```

This project is retained for reference and optional 3D experimentation. It is
not needed to run the primary browser game. Its server currently starts on
`ws://localhost:8765`, but it is not the production controller endpoint.

## Testing

Run the Python test suite from the game directory:

```powershell
cd python-game
python -m pytest
```

The tests cover collision detection, fruit geometry, slicing, particles,
sword trails, scoring, combos, and game integration.

## Architecture

The target data flow is:

```text
Phone sensors -> motion detection -> WebSocket -> Browser game
								  -> sword movement -> collision
								  -> sliced fruit, score, combo, effects
```

The phone and laptop are designed to communicate over the same local Wi-Fi
network. See the focused documentation in `docs/`, especially:

- [Project overview](docs/01-project-overview.md)
- [System architecture](docs/04-system-architecture.md)
- [Communication protocol](docs/06-communication-protocol.md)
- [Installation guide](docs/14-installation-guide.md)
- [Testing plan](docs/12-testing-plan.md)

## Current Status

The browser experience is the primary product. The Expo app's sensor and
WebSocket integration is still incomplete. The Python/Ursina branch is
optional and is not part of the selected production architecture.
