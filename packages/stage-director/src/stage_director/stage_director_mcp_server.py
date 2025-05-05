#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging

from mcp.server.fastmcp import FastMCP

from stage_director.command_queue import enqueue_command
from stage_director.models import (
    AcknowledgementPayload,
    SetExpressionCommand,
    SetExpressionPayload,
    LogMessagePayload,
    LogMessageCommand,
    SetPosePayload,
    SetPoseCommand,
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


# Add an addition tool
@mcp.tool()
async def set_expression(
    character_id: str,
    expression_name: str,
    weight: float,
) -> AcknowledgementPayload:
    payload = SetExpressionPayload(characterId=character_id, expressionName=expression_name, weight=weight)
    logger.info(f"MCP Tool 'setExpression' called: set_expression={payload}")
    try:
        command = SetExpressionCommand(payload=payload)
        await enqueue_command(command)
        return AcknowledgementPayload(status="Received")
    except Exception as e:
        logger.error(f"Error in set_expression tool: {e}", exc_info=True)
        return AcknowledgementPayload(status=f"Failed to set expression: {e}")


@mcp.tool()
async def log_message(message: str) -> AcknowledgementPayload:
    payload = LogMessagePayload(message=message)
    logger.info(f"MCP Tool 'logMessage' called: message={payload}")
    try:
        command = LogMessageCommand(payload=payload)
        await enqueue_command(command)
        return AcknowledgementPayload(status="Received")
    except Exception as e:
        logger.error(f"Error in log_message tool: {e}", exc_info=True)
        return AcknowledgementPayload(status=f"Failed to log message: {e}")


@mcp.tool()
async def set_pose(character_id: str, pose_name: str) -> AcknowledgementPayload:
    payload = SetPosePayload(characterId=character_id, poseName=pose_name)
    logger.info(f"MCP Tool 'setPose' called: set_pose={payload}")
    try:
        command = SetPoseCommand(payload=payload)
        await enqueue_command(command)
        return AcknowledgementPayload(status="Received")
    except Exception as e:
        logger.error(f"Error in set_pose tool: {e}", exc_info=True)
        return AcknowledgementPayload(status=f"Failed to set pose: {e}")


@mcp.tool()
async def trigger_animation(character_id: str, animation_name: str) -> AcknowledgementPayload:
    payload = TriggerAnimationPayload(characterId=character_id, animationName=animation_name)
    logger.info(f"MCP Tool 'triggerAnimation' called: trigger_animation={payload}")
    try:
        command = TriggerAnimationCommand(payload=payload)
        await enqueue_command(command)
        return AcknowledgementPayload(status="Received")
    except Exception as e:
        logger.error(f"Error in trigger_animation tool: {e}", exc_info=True)
        return AcknowledgementPayload(status=f"Failed to trigger animation: {e}")


@mcp.tool()
async def speak(character_id: str, message: str) -> AcknowledgementPayload:
    payload = SpeakPayload(characterId=character_id, message=message)
    logger.info(f"MCP Tool 'speak' called: speak={payload}")
    try:
        command = SpeakCommand(payload=payload)
        await enqueue_command(command)
        return AcknowledgementPayload(status="Received")
    except Exception as e:
        logger.error(f"Error in speak tool: {e}", exc_info=True)
        return AcknowledgementPayload(status=f"Failed to speak: {e}")


async def run_stage_director_mcp_server() -> None:
    """Run the MCP server."""
    await mcp.run_sse_async()
