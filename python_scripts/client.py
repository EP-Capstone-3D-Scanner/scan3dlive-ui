import asyncio
import sys
from websockets.asyncio.client import connect

async def test_client():
    uri = "ws://localhost:8001" #"ws://192.168.2.15:8001"
    try:
        # Connect to the server
        async with connect(uri) as websocket:
            print(f"Connected to {uri}")
            while True:
                
                # Send a test message
                message = input()
                await websocket.send(message)
                print(f"Sent: {message}")
                # Stay alive for a moment to ensure delivery
                await asyncio.sleep(1)
                response = await websocket.recv()
                print(response)
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    # Ensure Windows compatibility
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(test_client())