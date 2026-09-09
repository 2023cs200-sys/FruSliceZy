# Deployment Guide

## 1. Overview

FruSliceZy is primarily designed as a local-network project. The mobile
controller and browser game can be deployed separately.

## 2. Mobile Application

For development and demonstration, Expo Go can be used.

For a standalone Android application, an Expo production build can be created using the appropriate Expo build workflow.

The production application should be tested on the target device before demonstration.

## 3. Python Game

The Python game can be run directly on the target laptop.

Required items include:

- Python runtime
- Required Python packages
- Game assets
- Configuration files

## 4. Local Network

The laptop should run the WebSocket server on a reachable local network interface.

The configured WebSocket port must be allowed by the laptop firewall.

## 5. Demonstration Setup

Recommended setup:

```text
        Wi-Fi Router
          /      \
         /        \
   Smartphone    Laptop
   Controller     Game
```

## 6. Pre-Demonstration Checklist

- Start the browser game.
- Verify the WebSocket server is running.
- Connect the smartphone to the same Wi-Fi.
- Open the mobile controller.
- Enter the laptop IP.
- Test connection.
- Calibrate the controller.
- Test one or two slashes.
- Start the game.

## 7. Offline Operation

After all software dependencies are installed, the actual game communication does not require internet access. The smartphone and laptop only need to communicate through the local network.

## Current Deployment Status

The browser prototype can be built for static hosting from
`game-ui` with `npm run build`; the generated `dist/` directory
is standalone and does not require a Python server.

The phone-to-browser deployment is not end to end. Before a demonstration can
use it, the server must bind to a reachable LAN interface instead of
`localhost`, the mobile connection and sensor screens must be implemented, and
the missing Python runtime modules/assets must be supplied. Treat the LAN
checklist above as a future deployment plan.
