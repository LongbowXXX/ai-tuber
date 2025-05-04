#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging
from mcp.server.fastmcp import FastMCP

from stage_director.command_queue import enqueue_command
from stage_director.models import AcknowledgementPayload, SetExpressionCommand, SetExpressionPayload

logger = logging.getLogger("stage-director.mcp")

# Create an MCP server
mcp = FastMCP(
    "stage_director",
    host="0.0.0.0",
    port=8080,
)


# Add an addition tool
@mcp.tool()
async def set_expression(set_expression_payload: SetExpressionPayload) -> AcknowledgementPayload:
    logger.info(f"MCP Tool 'setExpression' called: set_expression_payload={set_expression_payload}")
    try:
        command = SetExpressionCommand(payload=set_expression_payload)
        await enqueue_command(command)
        return AcknowledgementPayload(status="Received")
    except Exception as e:
        logger.error(f"Error in set_expression tool: {e}", exc_info=True)
        return AcknowledgementPayload(status=f"Failed to set expression: {e}")


async def run_stage_director_mcp_server() -> None:
    """Run the MCP server."""
    await mcp.run_sse_async()
