import asyncio
import json
import websockets
from src.game.game import Game

async def handler(websocket, path=None):
    game = Game()
    game.start_game()
    
    async def game_loop():
        # 60 FPS tick
        dt = 1/60
        while True:
            # Add time dt logic if needed
            game.update(dt)
            state = {
                "score": game.score_manager.score,
                "combo": game.combo_manager.combo,
                "time_left": game.time_left,
                "fruits": [
                    {
                        "id": id(f),
                        "type": f.fruit_type,
                        "x": f.position.x,
                        "y": f.position.y,
                        "cut": f.cut
                    } for f in game.object_manager.fruits
                ]
            }
            try:
                await websocket.send(json.dumps({"type": "state", "state": state}))
            except websockets.exceptions.ConnectionClosed:
                break
            await asyncio.sleep(dt)

    async def receive_loop():
        try:
            async for message in websocket:
                data = json.loads(message)
                if data["type"] == "slice":
                    # handle slice collision
                    pass
        except websockets.exceptions.ConnectionClosed:
            pass

    await asyncio.gather(game_loop(), receive_loop())

async def main():
    print("WebSocket server running on ws://localhost:8765")
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
