#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging
from asyncio import Task
from contextlib import AsyncExitStack

from google.adk.tools.mcp_tool import MCPToolset, MCPTool
from google.adk.tools.mcp_tool.mcp_session_manager import SseServerParams
from mcp.types import CallToolResult

from vtuber_behavior_engine.stage_agents.models import AgentSpeech

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
        self._current_speak_task: Task[CallToolResult] | None = None

    @property
    def tools(self) -> list[MCPTool]:
        return self._tools

    async def speak(self, speech: AgentSpeech) -> None:
        if self._current_speak_task and not self._current_speak_task.done():
            logger.info("Waiting for the previous speak task to finish.")
            await self._current_speak_task
            self._current_speak_task = None
            logger.info("Finished waiting for the previous speak task to finish.")

        logger.info(f"Speaking {speech}")
        session = self._toolset.session
        self._current_speak_task = asyncio.create_task(
            session.call_tool(
                "speak",
                arguments={
                    "message": speech.text,
                    "character_id": speech.character_id,
                    "emotion": speech.emotion,
                },
            )
        )

    async def aclose(self) -> None:
        if self._exit_stack:
            await self._exit_stack.aclose()
