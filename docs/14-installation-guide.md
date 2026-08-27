# Installation Guide

## 1. Prerequisites

Install:

- Node.js
- npm
- Expo development environment
- Expo Go on an Android smartphone
- Python 3
- Ursina game engine (installed with the Python dependencies in step 4)
- Git

## 2. Clone the Project

```bash
git clone <repository-url>
cd SliceRush
```

## 3. Mobile Controller Setup

Navigate to the mobile project:

```bash
cd mobile-controller
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Open the project using Expo Go on the smartphone.

## 4. Python Game Setup

Open a second terminal and navigate to:

```bash
cd python-game
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

This installs the Ursina engine, the WebSocket server library, and the other Python dependencies.

## 5. Network Setup

Connect the smartphone and laptop to the same Wi-Fi network.

Find the laptop's local IP address.

Windows:

```bash
ipconfig
```

Look for the IPv4 address.

## 6. Start the Game

From `python-game`:

```bash
python main.py
```

The WebSocket server should start on the configured port.

## 7. Connect the Smartphone

Open the controller in Expo Go.

Enter the laptop's local IP address and port.

Example:

```text
192.168.1.10:8765
```

Press Connect.

## 8. Calibration

Hold the phone in a comfortable starting position and press Calibrate.

## 9. Start Playing

After the controller shows a successful connection:

1. Start the game.
2. Move the phone like a sword.
3. Cut fruits.
4. Avoid bombs.
5. Build combos.
