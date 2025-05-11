#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from contextlib import AsyncExitStack

from google.adk.tools.mcp_tool import MCPToolset, MCPTool
from google.adk.tools.mcp_tool.mcp_session_manager import SseServerParams

logger = logging.getLogger(__name__)


class StageDirectorMCPClient:
    @classmethod
    async def create_async(cls) -> "StageDirectorMCPClient":
        async_exit_stack = AsyncExitStack()
        toolset = MCPToolset(
            connection_params=SseServerParams(
                url="http://localhost:8080/sse",
            ),
        )
        await async_exit_stack.enter_async_context(toolset)
        tools = await toolset.load_tools()
        return cls(toolset, tools, async_exit_stack)

    def __init__(self, toolset: MCPToolset, tools: list[MCPTool], exit_stack: AsyncExitStack) -> None:
        self._tools = tools
        self._exit_stack = exit_stack
        self._toolset = toolset

    @property
    def tools(self) -> list[MCPTool]:
        return self._tools

    async def aclose(self) -> None:
        if self._exit_stack:
            await self._exit_stack.aclose()
