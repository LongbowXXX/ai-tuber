#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio
import json
import random
from typing import Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import logging

# Basic logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stage-director")

app = FastAPI(title="AI VTuber Stage Director", version="0.1.0")


# --- Helper to create command JSON ---
def create_command(command_name: str, payload: dict[str, str]) -> str:
    """Creates a JSON string for a command."""
    command: dict[str, Any] = {"command": command_name, "payload": payload}
    return json.dumps(command)


# --- Periodic Command Sender Task ---
async def send_periodic_commands(websocket: WebSocket) -> None:
    """Periodically sends test commands to the connected client."""
    counter = 0
    expressions = [
        "neutral",
        "happy",
        "sad",
        "angry",
        "relaxed",
        "Surprised",
    ]
    try:
        while True:
            await asyncio.sleep(5)  # Wait for 5 seconds

            # Send log message command
            log_payload = {"message": f"Periodic server ping #{counter}"}
            log_command_json = create_command("logMessage", log_payload)
            logger.info(f"Sending command to {websocket.client}: {log_command_json}")
            await websocket.send_text(log_command_json)
            counter += 1

            await asyncio.sleep(1)  # Slight delay

            # Send setExpression command with random expression
            random_expression = random.choice(expressions)
            expression_payload: dict[str, Any] = {
                "characterId": "avatar1",  # Placeholder
                "expressionName": random_expression,
                "weight": round(random.uniform(0.5, 1.0), 2),  # Random weight
            }
            expression_command_json = create_command("setExpression", expression_payload)
            logger.info(f"Sending command to {websocket.client}: {expression_command_json}")
            await websocket.send_text(expression_command_json)

    except WebSocketDisconnect:
        logger.info("Sender task: Client disconnected.")
    except asyncio.CancelledError:
        logger.info("Sender task cancelled.")
    except Exception as e:
        logger.error(f"Error in sender task for {websocket.client}: {e}", exc_info=True)


# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    Handles WebSocket connections from vtube-stage clients.
    Listens for incoming messages and can send commands back.
    """
    await websocket.accept()
    logger.info(f"WebSocket connection established: {websocket.client}")

    # Start the periodic sender task
    sender_task: asyncio.Task[None] = asyncio.create_task(send_periodic_commands(websocket))

    try:
        while True:
            # Listen for incoming messages (if needed for future interaction)
            data = await websocket.receive_text()
            logger.info(f"Received message from {websocket.client}: {data}")
            # --- TODO: Implement logic based on client messages if necessary ---
            # For now, we primarily send commands, not react to client messages.
            # Acknowledge receipt?
            ack_payload = {"status": "Received", "original_message": data}
            ack_cmd = create_command("acknowledgement", ack_payload)
            await websocket.send_text(ack_cmd)  # Example: Send acknowledgement

    except WebSocketDisconnect:
        logger.info(f"WebSocket connection closed: {websocket.client}")
    except Exception as e:
        logger.error(f"WebSocket error for {websocket.client}: {e}", exc_info=True)
        # Optionally try to close the websocket gracefully
        await websocket.close(code=1011)  # Internal Error
    finally:
        # Cancel the sender task when the connection closes
        logger.info(f"Cancelling sender task for {websocket.client}")
        sender_task.cancel()
        try:
            await sender_task  # Wait for the task to actually cancel
        except asyncio.CancelledError:
            logger.info("Sender task successfully cancelled.")
        logger.info(f"Cleaned up WebSocket connection: {websocket.client}")


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
