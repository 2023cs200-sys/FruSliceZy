# FruSliceZy Task Tracker

This tracker reflects the current repository rather than the original target
specification.

## Completed

- [x] Build a playable React/Vite browser prototype.
- [x] Add mouse and touch fruit slicing.
- [x] Add fruit splitting visuals, particles, sound, combos, bombs, pause,
      game-over, settings, and session high scores.
- [x] Create the Expo Router mobile-controller shell.
- [x] Create a Python WebSocket backend for controller message relay.

## In Progress

- [ ] Implement the mobile connection and controller screens for the browser host.
- [ ] Implement accelerometer and gyroscope subscriptions and calibration.
- [ ] Define and validate the motion WebSocket messages.
- [ ] Connect received motion to the browser sword and collision loop.

## Planned

- [x] Host a Python WebSocket endpoint on the laptop.
- [ ] Keep the Python WebSocket backend small and focused on message relay.
- [ ] Implement persistent high scores and settings.
- [ ] Implement dynamic difficulty in the browser game.
- [ ] Add mobile, protocol, persistence, and end-to-end tests.
- [ ] Package browser, mobile, and desktop demonstration builds.

## Supported Commands

Browser prototype:

```powershell
cd motion-fruit-cutter
npm install
npm run dev
npm run build
```

Mobile controller:

```powershell
cd mobile-controller
npm install
npm start
```

Python WebSocket backend:

```powershell
cd python-game
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python main.py
```

The browser prototype is the primary game. The mobile command starts the
controller foundation, while the Python command starts the backend. The
mobile/browser client integration is still incomplete.
