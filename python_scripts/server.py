import asyncio
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosedOK

async def handler(websocket):
    async for message in websocket:
        print(message)
        await websocket.send(f"Thank you for sending me [{message}]!")
        continue


async def main():
    async with serve(handler, "", 8001) as server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(main())
    except KeyboardInterrupt:
        pass