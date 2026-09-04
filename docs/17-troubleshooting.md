# Troubleshooting

## 1. Phone Cannot Connect

### Possible Causes
- Devices are on different networks.
- Incorrect laptop IP.
- Incorrect port.
- Firewall blocking the WebSocket server.
- Server is not running.

### Solutions
1. Confirm both devices use the same Wi-Fi.
2. Check the laptop IPv4 address.
3. Verify the port.
4. Start the Python server.
5. Check firewall settings.

## 2. Motion Is Not Detected

### Possible Causes
- Sensor unavailable.
- Sensor listener not running.
- Motion threshold is too high.
- Controller was not calibrated.

### Solutions
- Confirm the phone supports the required sensors.
- Restart the controller.
- Calibrate again.
- Adjust the motion threshold.

## 3. Too Many False Slashes

Reduce the motion sensitivity by increasing the detection threshold or applying stronger filtering.

## 4. Slash Direction Is Incorrect

Recalibrate the controller and verify the motion-to-sword 3D mapping.

## 5. Game Is Lagging

Possible solutions:

- Lower the 3D render resolution or quality.
- Use lower-poly fruit models.
- Reduce the number of objects in the air.
- Reduce particle effects.
- Reduce sensor transmission frequency.
- Optimize collision detection.
- Check laptop CPU/GPU usage.

## 6. Python Backend Does Not Start

Activate the virtual environment and run:

```bash
pip install -r requirements.txt
python main.py
```

The backend requires Python and the `websockets` package. Ursina, 3D assets,
and graphics drivers are not required.

## 7. No Sound

Check:

- Sound files exist.
- File paths are correct.
- Audio is enabled.
- System volume is not muted.

## 8. Python Dependency Error

Activate the virtual environment and run:

```bash
pip install -r requirements.txt
```

## 9. Expo Dependency Error

From `mobile-controller`:

```bash
npm install
```

Then restart the Expo development server.

## 10. Controller Disconnects

The game should display a disconnected state. Restart or reconnect the controller if necessary.

## 11. Firewall Issues

If the phone cannot reach the laptop despite using the correct IP, check whether the Python application or configured WebSocket port is allowed through the firewall.

## Current Implementation Notes

The phone connection and motion-detection sections describe planned
functionality. The Expo connection/controller screens are placeholders, while
the Python backend listens on `0.0.0.0:8765`.

If `python main.py` fails, confirm that port `8765` is free and that the
`websockets` package is installed in the active environment.

For the supported browser path, run commands from `motion-fruit-cutter` and
use `npm run build` to distinguish application errors from development-server
issues.
