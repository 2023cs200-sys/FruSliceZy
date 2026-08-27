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

## 6. Ursina / Game Window Does Not Start

### Possible Causes
- Ursina is not installed.
- Graphics drivers are outdated.
- OpenGL is not supported by the system.

### Solutions
1. Activate the virtual environment and run `pip install -r requirements.txt`.
2. Update graphics drivers.
3. Try running the game on a machine with OpenGL-capable graphics.

## 7. Missing 3D Models or Textures

Check:

- Model files exist in `assets/models/`.
- File names match the names used in the code.
- Texture files exist in `assets/textures/`.
- The `python-game` folder is the working directory when starting the game.

## 8. No Sound

Check:

- Sound files exist.
- File paths are correct.
- Audio is enabled.
- System volume is not muted.

## 9. Python Dependency Error

Activate the virtual environment and run:

```bash
pip install -r requirements.txt
```

## 10. Expo Dependency Error

From `mobile-controller`:

```bash
npm install
```

Then restart the Expo development server.

## 11. Controller Disconnects

The game should display a disconnected state. Restart or reconnect the controller if necessary.

## 12. Firewall Issues

If the phone cannot reach the laptop despite using the correct IP, check whether the Python application or configured WebSocket port is allowed through the firewall.
