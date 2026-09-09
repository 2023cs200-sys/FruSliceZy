# Installation Guide

## 1. Prerequisites

Install:

- Node.js
- npm
- Expo development environment
- Expo Go on an Android smartphone
- Python 3
- Git

## 2. Clone the Project

```bash
git clone <repository-url>
cd FruSliceZy
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

Open the project using Expo Go on a physical smartphone. The phone and laptop
must use the same Wi-Fi network.

## 4. Python WebSocket Backend Setup

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

This installs the Python WebSocket backend dependency.

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

The backend should start on port `8765` and listen on all network interfaces.

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

## 9. Start the Browser Game

Start the browser client in a third terminal:

```bash
cd motion-fruit-cutter
npm install
npm run dev
```

Open the Vite URL, then choose **WITH CONTROLLER**. After the controller shows
a successful connection:

1. Start the game.
2. Move the phone like a sword.
3. Cut fruits.
4. Avoid bombs.
5. Build combos.

## Mouse-Only Play

To play without a phone, choose **WITHOUT CONTROLLER** from the browser's Play
button. Mouse and touch slicing work without the Python backend.
