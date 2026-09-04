import asyncio
import json

import websockets


CLIENTS = set()


async def broadcast(sender, message):
    """Forward a valid controller/game message to the other connected peer."""
    disconnected = set()
    for client in CLIENTS - {sender}:
        try:
            await client.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected.add(client)
    CLIENTS.difference_update(disconnected)


async def handler(websocket):
    CLIENTS.add(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({"type": "error", "message": "Invalid JSON"}))
                continue

            if not isinstance(data, dict) or not isinstance(data.get("type"), str):
                await websocket.send(json.dumps({"type": "error", "message": "Message type is required"}))
                continue

            await broadcast(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        CLIENTS.discard(websocket)

async def main():
    print("Python WebSocket backend running on ws://0.0.0.0:8765")
    async with websockets.serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
