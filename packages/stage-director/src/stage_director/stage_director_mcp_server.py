#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging
import uuid

from mcp.server.fastmcp import FastMCP

from stage_director.command_queue import enqueue_command
from stage_director.models import (
    TriggerAnimationPayload,
    TriggerAnimationCommand,
    SpeakPayload,
    SpeakCommand,
)

logger = logging.getLogger("stage-director.mcp")

# Create an MCP server
mcp = FastMCP(
    "stage_director",
    host="0.0.0.0",
    port=8080,
)


@mcp.tool()
async def trigger_animation(character_id: str, animation_name: str) -> str:
    payload = TriggerAnimationPayload(characterId=character_id, animationName=animation_name)
    logger.info(f"MCP Tool 'triggerAnimation' called: trigger_animation={payload}")
    try:
        command = TriggerAnimationCommand(payload=payload)
        await enqueue_command(command)
        return "Success"
    except Exception as e:
        logger.error(f"Error in trigger_animation tool: {e}", exc_info=True)
        return f"Failed to trigger animation: {e}"


@mcp.tool()
async def speak(character_id: str, message: str, emotion: str) -> str:
    # Generate a UUID for the speakId
    speak_id = str(uuid.uuid4())

    payload = SpeakPayload(characterId=character_id, message=message, emotion=emotion, speakId=speak_id)
    logger.info(f"MCP Tool 'speak' called: speak={payload}")
    try:
        command = SpeakCommand(payload=payload)
        await enqueue_command(command)
        await asyncio.sleep(1)
        return "Success"
    except Exception as e:
        logger.error(f"Error in speak tool: {e}", exc_info=True)
        return f"Failed to speak: {e}"


async def run_stage_director_mcp_server() -> None:
    """Run the MCP server."""
    await mcp.run_sse_async()
