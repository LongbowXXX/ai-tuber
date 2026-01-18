#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
import os
import uuid
from typing import Optional

from mcp.server.fastmcp import FastMCP

from stage_director.command_queue import enqueue_command, wait_for_command
from stage_director.models import (
    TriggerAnimationPayload,
    TriggerAnimationCommand,
    SpeakPayload,
    SpeakCommand,
    DisplayMarkdownTextPayload,
    DisplayMarkdownTextCommand,
    ControlCameraPayload,
    ControlCameraCommand,
)

logger = logging.getLogger("stage-director.mcp")

# Create an MCP server
mcp = FastMCP(
    "stage_director",
    host=os.getenv("STAGE_DIRECTOR_MCP_HOST", "0.0.0.0"),
    port=int(os.getenv("STAGE_DIRECTOR_MCP_PORT", "8080")),
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
async def speak(character_id: str, message: str, caption: str, emotion: str, style: Optional[str] = None) -> str:
    # Generate a UUID for the speakId
    speak_id = str(uuid.uuid4())

    payload = SpeakPayload(
        characterId=character_id,
        message=message,
        caption=caption,
        emotion=emotion,
        style=style,
        speakId=speak_id,
    )
    logger.info(f"MCP Tool 'speak' called: speak={payload}")
    try:
        command = SpeakCommand(payload=payload)
        await enqueue_command(command)
        await wait_for_command(speak_id)
        return "Success"
    except Exception as e:
        logger.error(f"Error in speak tool: {e}", exc_info=True)
        return f"Failed to speak: {e}"


@mcp.tool()
async def display_markdown_text(text: str) -> str:
    """Display Markdown text."""
    logger.info(f"MCP Tool 'display_markdown_text' called: text={text}")
    payload = DisplayMarkdownTextPayload(text=text)

    try:
        command = DisplayMarkdownTextCommand(payload=payload)
        await enqueue_command(command)
        return "Success"
    except Exception as e:
        logger.error(f"Error in display_markdown_text tool: {e}", exc_info=True)
        return f"Failed to display_markdown_text: {e}"


@mcp.tool()
async def control_camera(mode: str, target_id: str = "", duration: float = 1.0) -> str:
    """
    Control the vtube-stage camera.

    Args:
        mode: The camera mode ("default", "intro", "closeUp", "fullBody", "lowAngle", "highAngle", "sideRight",
              "sideLeft").
        target_id: The ID of the target to focus on (optional).
        duration: The duration of the camera transition in seconds (default: 1.0).
    """
    logger.info(f"MCP Tool 'control_camera' called: mode={mode}, target_id={target_id}, duration={duration}")
    payload = ControlCameraPayload(mode=mode, targetId=target_id, duration=duration)

    try:
        command = ControlCameraCommand(payload=payload)
        await enqueue_command(command)
        return "Success"
    except Exception as e:
        logger.error(f"Error in control_camera tool: {e}", exc_info=True)
        return f"Failed to control camera: {e}"


async def run_stage_director_mcp_server() -> None:
    """Run the MCP server."""
    await mcp.run_sse_async()
