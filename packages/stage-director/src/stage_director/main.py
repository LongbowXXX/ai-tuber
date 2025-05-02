#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import logging

# Basic logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stage-director")

app = FastAPI(title="AI VTuber Stage Director", version="0.1.0")

# --- WebSocket Endpoint ---


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    Handles WebSocket connections from vtube-stage clients.
    Listens for incoming messages and can send commands back.
    """
    await websocket.accept()
    logger.info(f"WebSocket connection established: {websocket.client}")
    try:
        while True:
            # Wait for a message from the client (vtube-stage)
            # For now, expect text messages, could be json later
            data = await websocket.receive_text()
            logger.info(f"Received message from {websocket.client}: {data}")

            # --- TODO: Implement command parsing and processing logic here ---
            # Example: Parse `data` as JSON, determine command, call functions...

            # For now, just echo the message back for testing
            await websocket.send_text(f"Server received: {data}")

    except WebSocketDisconnect:
        logger.info(f"WebSocket connection closed: {websocket.client}")
    except Exception as e:
        logger.error(f"WebSocket error for {websocket.client}: {e}", exc_info=True)
        # Optionally try to close the websocket gracefully
        await websocket.close(code=1011)  # Internal Error
    finally:
        # --- TODO: Add any necessary cleanup logic here ---
        logger.info(f"Cleaning up WebSocket connection: {websocket.client}")


# --- HTTP Endpoints (Optional for testing/health check) ---


@app.get("/")
async def read_root() -> dict[str, str]:
    """Basic HTTP endpoint for health check or info."""
    return {"message": "Stage Director is running"}


# --- Uvicorn Runner (for easy execution) ---
# You can run this file directly using 'python src/main.py'
# Or preferably use: uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

if __name__ == "__main__":
    import uvicorn

    logger.info("Starting Stage Director server with Uvicorn...")
    # Note: Running directly like this is less flexible than using the uvicorn command.
    # The command line `uvicorn src.main:app --reload ...` is generally preferred.
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
