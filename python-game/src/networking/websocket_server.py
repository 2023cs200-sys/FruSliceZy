import asyncio
import json
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, Set, Any

import websockets
from src.motion_mapper import MotionMapper


class ClientRole(Enum):
    UNKNOWN = "unknown"
    CONTROLLER = "controller"
    BROWSER = "browser"


class MessageType(Enum):
    MOTION = "motion"
    CALIBRATE = "calibrate"
    PING = "ping"
    STATUS = "status"
    CONNECTION = "connection"
    GAME_STATE = "game"
    ERROR = "error"
    ACK = "ack"
    TUNING = "tuning"


@dataclass
class Client:
    websocket: Any
    role: ClientRole = ClientRole.UNKNOWN
    client_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    connected_at: float = field(default_factory=time.time)
    last_ping: float = field(default_factory=time.time)
    metadata: Dict = field(default_factory=dict)


class WebSocketServer:
    def __init__(self, host: str = "0.0.0.0", port: int = 8765):
        self.host = host
        self.port = port
        self.clients: Dict[str, Client] = {}
        self.controller_client: Optional[Client] = None
        self.browser_client: Optional[Client] = None
        self._running = False
        self.motion_mapper = MotionMapper()
        self.tuning_config = {
            'sensitivity': 7.0,
            'smoothing': 5.0,
            'motion_threshold': 2.5,
            'slash_threshold': 5.0,
            'sword_speed': 15.0,
            'rotation_sensitivity': 45.0,
        }

    async def start(self):
        self._running = True
        print(f"WebSocket server starting on ws://{self.host}:{self.port}")
        async with websockets.serve(self._handle_connection, self.host, self.port):
            await asyncio.Future()

    async def stop(self):
        self._running = False
        for client in list(self.clients.values()):
            await self._disconnect_client(client.client_id, "Server shutting down")
        print("WebSocket server stopped")

    async def _handle_connection(self, websocket):
        client = Client(websocket=websocket)
        self.clients[client.client_id] = client
        print(f"Client connected: {client.client_id} (total: {len(self.clients)})")

        try:
            await self._send_connection_status(client, "connected")
            async for message in websocket:
                await self._process_message(client, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error handling client {client.client_id}: {e}")
        finally:
            await self._disconnect_client(client.client_id, "Connection closed")

    async def _process_message(self, client: Client, raw_message: str):
        try:
            data = json.loads(raw_message)
        except json.JSONDecodeError:
            await self._send_error(client, "Invalid JSON format")
            return

        if not isinstance(data, dict):
            await self._send_error(client, "Message must be a JSON object")
            return

        msg_type = data.get("type")
        if not isinstance(msg_type, str):
            await self._send_error(client, "Message 'type' field is required and must be a string")
            return

        client.last_ping = time.time()

        try:
            if msg_type == MessageType.MOTION.value:
                await self._handle_motion(client, data)
            elif msg_type == MessageType.CALIBRATE.value:
                await self._handle_calibrate(client, data)
            elif msg_type == MessageType.TUNING.value:
                await self._handle_tuning(client, data)
            elif msg_type == MessageType.PING.value:
                await self._handle_ping(client, data)
            elif msg_type == MessageType.STATUS.value:
                await self._handle_status(client, data)
            elif msg_type == MessageType.GAME_STATE.value:
                await self._handle_game_state(client, data)
            else:
                await self._send_error(client, f"Unknown message type: {msg_type}")
        except Exception as e:
            print(f"Error processing {msg_type} from {client.client_id}: {e}")
            await self._send_error(client, f"Server error processing {msg_type}")

    async def _handle_motion(self, client: Client, data: Dict):
        if client.role == ClientRole.UNKNOWN:
            client.role = ClientRole.CONTROLLER
            self.controller_client = client
            print(f"Client {client.client_id} registered as CONTROLLER")

        required_fields = ["timestamp", "accelerometer", "gyroscope"]
        for field_name in required_fields:
            if field_name not in data:
                await self._send_error(client, f"Missing required field: {field_name}")
                return

        if not self._validate_sensor_data(data["accelerometer"]) or not self._validate_sensor_data(data["gyroscope"]):
            await self._send_error(client, "Invalid sensor data: values must be numeric")
            return

        accel = data["accelerometer"]
        gyro = data["gyroscope"]

        self.motion_mapper.update_config(self.tuning_config)
        mapped = self.motion_mapper.map(accel, gyro)

        relay_data = {
            "type": "motion",
            "timestamp": data["timestamp"],
            "accelerometer": accel,
            "gyroscope": gyro,
            "sword_position": mapped["sword_position"],
            "sword_rotation": mapped["sword_rotation"],
            "motion_magnitude": mapped["motion_magnitude"],
            "is_slashing": mapped["is_slashing"],
            "slash_direction": mapped["slash_direction"],
            "calibrated": mapped["calibrated"],
        }

        if self.browser_client and self.browser_client.websocket:
            try:
                await self.browser_client.websocket.send(json.dumps(relay_data))
            except websockets.exceptions.ConnectionClosed:
                print("Browser client disconnected during motion relay")
                self.browser_client = None

        await self._send_ack(client, "motion")

    async def _handle_calibrate(self, client: Client, data: Dict):
        if client.role == ClientRole.UNKNOWN:
            client.role = ClientRole.CONTROLLER
            self.controller_client = client

        accel = data.get("accelerometer", {})
        if accel:
            self.motion_mapper.set_calibration(
                accel.get('x', 0),
                accel.get('y', 0),
                accel.get('z', 0),
            )
            print(f"[MotionMapper] Calibration updated: {self.motion_mapper.calibration_offset}")

        if self.browser_client and self.browser_client.websocket:
            try:
                await self.browser_client.websocket.send(json.dumps({"type": "calibrate", "calibrated": True}))
            except websockets.exceptions.ConnectionClosed:
                self.browser_client = None

        await self._send_ack(client, "calibrate")

    async def _handle_tuning(self, client: Client, data: Dict):
        config = data.get("config", {})
        for key, value in config.items():
            if key in self.tuning_config:
                self.tuning_config[key] = float(value)
        self.motion_mapper.update_config(self.tuning_config)
        print(f"[MotionMapper] Tuning updated: {self.tuning_config}")
        await self._send_ack(client, "tuning")

    async def _handle_ping(self, client: Client, data: Dict):
        await self._send_ack(client, "ping")

    async def _handle_status(self, client: Client, data: Dict):
        status = data.get("status")
        if status == "ready":
            if client.role == ClientRole.UNKNOWN:
                client.role = ClientRole.CONTROLLER
                self.controller_client = client
            client.metadata["ready"] = True

        await self._send_ack(client, "status")

    async def _handle_game_state(self, client: Client, data: Dict):
        if client.role == ClientRole.UNKNOWN:
            client.role = ClientRole.BROWSER
            self.browser_client = client
            print(f"Client {client.client_id} registered as BROWSER")

        if self.controller_client and self.controller_client.websocket:
            try:
                await self.controller_client.websocket.send(json.dumps(data))
            except websockets.exceptions.ConnectionClosed:
                self.controller_client = None

        await self._send_ack(client, "game")

    def _validate_sensor_data(self, sensor_data: Dict) -> bool:
        if not isinstance(sensor_data, dict):
            return False
        required_axes = ["x", "y", "z"]
        for axis in required_axes:
            if axis not in sensor_data:
                return False
            value = sensor_data[axis]
            if not isinstance(value, (int, float)):
                return False
            if abs(value) > 100:
                return False
        return True

    async def _send_connection_status(self, client: Client, status: str):
        message = {"type": "connection", "status": status, "client_id": client.client_id}
        await self._safe_send(client, message)

    async def _send_ack(self, client: Client, original_type: str):
        message = {"type": "ack", "original_type": original_type, "timestamp": time.time()}
        await self._safe_send(client, message)

    async def _send_error(self, client: Client, error_message: str):
        message = {"type": "error", "message": error_message, "timestamp": time.time()}
        await self._safe_send(client, message)

    async def _safe_send(self, client: Client, message: Dict):
        try:
            await client.websocket.send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error sending to {client.client_id}: {e}")

    async def _disconnect_client(self, client_id: str, reason: str):
        client = self.clients.pop(client_id, None)
        if not client:
            return

        if client == self.controller_client:
            self.controller_client = None
        if client == self.browser_client:
            self.browser_client = None

        print(f"Client disconnected: {client_id} ({client.role.value}) - {reason} (remaining: {len(self.clients)})")

        if self.controller_client and self.controller_client.websocket:
            await self._safe_send(self.controller_client, {
                "type": "connection",
                "status": "peer_disconnected",
                "peer_role": client.role.value
            })

        if self.browser_client and self.browser_client.websocket:
            await self._safe_send(self.browser_client, {
                "type": "connection",
                "status": "peer_disconnected",
                "peer_role": client.role.value
            })


async def main():
    server = WebSocketServer()
    await server.start()


if __name__ == "__main__":
    asyncio.run(main())