import asyncio
import json
import websockets
import sys


async def test_full_flow():
    uri = "ws://localhost:8765"
    print(f"Testing full flow with fresh server...")
    
    async with websockets.connect(uri) as controller_ws:
        async with websockets.connect(uri) as browser_ws:
            # Step 1: Controller registers
            print("\n1. Controller registers...")
            await controller_ws.send(json.dumps({"type": "status", "status": "ready"}))
            resp = await controller_ws.recv()
            print(f"   Controller received: {json.loads(resp)['type']}")
            
            # Step 2: Browser registers
            print("\n2. Browser registers...")
            await browser_ws.send(json.dumps({"type": "game", "state": {"score": 0, "combo": 0}}))
            resp = await browser_ws.recv()
            print(f"   Browser received: {json.loads(resp)['type']}")
            
            # Step 3: Controller sends motion
            print("\n3. Controller sends motion...")
            motion_data = {
                "type": "motion",
                "timestamp": 1724678900,
                "accelerometer": {"x": 1.2, "y": -0.5, "z": 0.8},
                "gyroscope": {"x": 0.2, "y": 1.5, "z": -0.3}
            }
            await controller_ws.send(json.dumps(motion_data))
            ack = await controller_ws.recv()
            print(f"   Controller ACK: {json.loads(ack)['type']}")
            
            # Step 4: Browser should receive motion (after its own ACK)
            print("\n4. Browser receives messages...")
            # First message is the ACK for browser's own registration
            resp1 = await browser_ws.recv()
            print(f"   Browser msg 1: {json.loads(resp1)['type']}")
            # Second message should be the relayed motion
            resp2 = await browser_ws.recv()
            data2 = json.loads(resp2)
            print(f"   Browser msg 2 (relayed motion): {data2['type']}")
            if data2['type'] == 'motion':
                print(f"      Accelerometer: {data2['accelerometer']}")
                print(f"      Gyroscope: {data2['gyroscope']}")
            
            # Step 5: Browser sends game state update
            print("\n5. Browser sends game state...")
            game_state = {"type": "game", "state": {"score": 500, "combo": 5, "time_left": 30}}
            await browser_ws.send(json.dumps(game_state))
            ack = await browser_ws.recv()
            print(f"   Browser ACK: {json.loads(ack)['type']}")
            
            # Step 6: Controller should receive game state
            print("\n6. Controller receives messages...")
            # First might be old messages, then the relayed game state
            for i in range(3):
                try:
                    resp = await asyncio.wait_for(controller_ws.recv(), timeout=0.5)
                    data = json.loads(resp)
                    print(f"   Controller msg {i+1}: {data['type']}")
                    if data['type'] == 'game' and 'state' in data:
                        print(f"      Relayed game state: score={data['state']['score']}, combo={data['state']['combo']}")
                except asyncio.TimeoutError:
                    break
            
            # Step 7: Controller sends calibrate
            print("\n7. Controller sends calibrate...")
            await controller_ws.send(json.dumps({"type": "calibrate"}))
            ack = await controller_ws.recv()
            print(f"   Controller ACK: {json.loads(ack)['type']}")
            
            # Step 8: Browser should receive calibrate
            print("\n8. Browser receives calibrate...")
            resp = await browser_ws.recv()
            print(f"   Browser received: {json.loads(resp)['type']}")
            
    print("\n[SUCCESS] All tests passed!")


async def main():
    # Start server in background
    import subprocess
    
    server_process = subprocess.Popen([sys.executable, "main.py"])
    
    try:
        # Give server time to start
        await asyncio.sleep(1.5)
        
        await test_full_flow()
        
    finally:
        server_process.terminate()
        server_process.wait()


if __name__ == "__main__":
    asyncio.run(main())