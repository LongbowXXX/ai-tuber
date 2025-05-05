#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from contextlib import AsyncExitStack

from google.adk.tools.mcp_tool import MCPToolset, MCPTool
from google.adk.tools.mcp_tool.mcp_session_manager import SseServerParams

logger = logging.getLogger(__name__)


async def get_tools_async() -> tuple[list[MCPTool], AsyncExitStack]:
    logger.info("get_tools_async() in.")
    tools, exit_stack = await MCPToolset.from_server(
        connection_params=SseServerParams(
            url="http://localhost:8080/sse",
        )
    )
    logger.info(f"get_tools_async() out. tools={tools}")
    return tools, exit_stack
