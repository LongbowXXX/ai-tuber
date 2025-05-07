#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from .command_queue import dequeue_command, mark_command_done
from .models import (
    AcknowledgementPayload,
    AcknowledgementCommand,
    create_command_json,
)

logger = logging.getLogger("stage-director.websocket")


async def process_command_queue(websocket: WebSocket) -> None:
    """
    It monitors the command_queue, retrieves commands and sends them to the WebSocket.
    """
    try:
        while True:
            command = await dequeue_command()
            command_json = create_command_json(command)

            logger.info(f"Sending command from queue to {websocket.client}: {command_json}")
            await websocket.send_text(command_json)
            mark_command_done()

    except asyncio.CancelledError:
        logger.info("Command queue processing task cancelled.")
    except Exception as e:
        logger.error(f"Error while processing command queue for {websocket.client}: {e}", exc_info=True)


# --- WebSocket Endpoint ---
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    Handles WebSocket connections from vtube-stage clients.
    Listens for incoming messages and can send commands back.
    """
    await websocket.accept()
    logger.info(f"WebSocket connection established: {websocket.client}")

    # sender_task: asyncio.Task[None] = asyncio.create_task(send_periodic_commands(websocket))
    sender_task: asyncio.Task[None] = asyncio.create_task(process_command_queue(websocket))

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message from {websocket.client}: {data}")

            try:
                original_msg_data: str | dict[str, Any] | None = json.loads(data)
            except json.JSONDecodeError:
                original_msg_data = data

            ack_payload_model = AcknowledgementPayload(status="Received", original_message=original_msg_data)
            ack_cmd_model = AcknowledgementCommand(payload=ack_payload_model)
            ack_cmd_json = create_command_json(ack_cmd_model)
            await websocket.send_text(ack_cmd_json)

    except WebSocketDisconnect:
        logger.info(f"WebSocket connection closed: {websocket.client}")
    except Exception as e:
        logger.error(f"WebSocket error for {websocket.client}: {e}", exc_info=True)
        await websocket.close(code=1011)
    finally:
        logger.info(f"Cancelling sender task for {websocket.client}")
        sender_task.cancel()
        try:
            await sender_task
        except asyncio.CancelledError:
            logger.info("Sender task successfully cancelled.")
        logger.info(f"Cleaned up WebSocket connection: {websocket.client}")
