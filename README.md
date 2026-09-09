# FruSliceZy

FruSliceZy is a motion-controlled fruit-cutting game project. The selected
architecture uses a phone as a sword controller, a Python WebSocket backend,
and the browser as the game host.

## Project Parts

| Directory | Purpose | Technology |
| --- | --- | --- |
| `motion-fruit-cutter` | Primary game client with menus, HUD, fruit spawning, slicing, combos, bombs, effects, sound, and controller/mouse play modes | React, Vite |
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
Choose **WITH CONTROLLER** for phone control or **WITHOUT CONTROLLER** for
mouse/touch play. Controller mode requires the Python WebSocket backend and a
phone and laptop on the same Wi-Fi network.

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

Use the Expo CLI prompts or scan the QR code with Expo Go. The app provides
home, connection, controller, and settings routes. Use a physical Android or
iOS device for sensor testing; emulators do not provide the phone motion data
required by the controller.

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

The backend relays JSON messages between one Expo controller and one browser
client, and maps sensor data to sword position, rotation, slash state, and
direction. It does not render the game.

The server listens on all network interfaces at port `8765`. Use the laptop's
local IP address from the mobile controller, for example
`ws://192.168.1.10:8765`.

## Testing

Run the WebSocket integration check from `python-game` while no other server
is using port `8765`:

```powershell
python test_client.py
```

Build the browser client with `npm run build`. Validate the mobile bundle with
`npx expo export --platform android`.

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

The browser supports mouse/touch play and phone-controller play. The Expo app
sends motion data through the Python WebSocket relay, and the browser maps the
relayed sword position into the canvas game. Scores remain in memory for the
active browser session; there is no persistent score store.
