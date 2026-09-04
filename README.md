# FruSliceZy

FruSliceZy is a motion-controlled fruit-cutting game project. The selected
architecture uses a phone as a sword controller, a Python WebSocket backend,
and the browser as the game host.

## Project Parts

| Directory | Purpose | Technology |
| --- | --- | --- |
| `motion-fruit-cutter` | Primary game client with menus, HUD, fruit spawning, slicing, combos, bombs, effects, sound, and high scores | React, Vite |
| `mobile-controller` | Phone-only motion controller; sends sensor events to the browser game | React Native, Expo |
| `python-game` | Python WebSocket backend that relays controller messages between the phone and browser | Python, websockets |
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

## Quick Start: Python WebSocket Backend

Prerequisites: Python 3.10 or newer is recommended. The game dependencies are
listed in `python-game/requirements.txt`.

```powershell
cd python-game
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python main.py
```

The backend relays JSON messages between connected Expo and browser clients.
It does not render the game.

The server listens on all network interfaces at port `8765`. Use the laptop's
local IP address from the mobile controller, for example
`ws://192.168.1.10:8765`.

## Testing

The current backend has no automated test suite. Browser and mobile tests
should be added alongside the controller integration.

## Architecture

The target data flow is:

```text
Phone sensors -> motion detection -> WebSocket -> Browser game
								  -> sword movement -> collision
								  -> sliced fruit, score, combo, effects
```

The phone and laptop communicate over the same local Wi-Fi network through the
Python backend, with the browser owning the game UI and gameplay. See the
focused documentation in `docs/`, especially:

- [Project overview](docs/01-project-overview.md)
- [System architecture](docs/04-system-architecture.md)
- [Communication protocol](docs/06-communication-protocol.md)
- [Installation guide](docs/14-installation-guide.md)
- [Testing plan](docs/12-testing-plan.md)

## Current Status

The browser experience is the primary game. The Expo app's sensor and
WebSocket integration is still incomplete. Python is the selected backend.
