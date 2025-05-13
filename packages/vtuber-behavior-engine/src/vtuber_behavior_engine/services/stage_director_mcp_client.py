#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging
from asyncio import Task
from contextlib import AsyncExitStack

from google.adk.tools.mcp_tool import MCPToolset, MCPTool
from google.adk.tools.mcp_tool.mcp_session_manager import SseServerParams

from vtuber_behavior_engine.stage_agents.models import AgentSpeech

logger = logging.getLogger(__name__)


class StageDirectorMCPClient:
    @classmethod
    async def create_async(cls) -> "StageDirectorMCPClient":
        logger.info("create_async")
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
        logger.info("__init__")
        self._tools = tools
        self._exit_stack = exit_stack
        self._toolset = toolset
        self._current_speak_task: Task[None] | None = None

    @property
    def tools(self) -> list[MCPTool]:
        logger.info("tools")
        return self._tools

    async def speak(self, speech: AgentSpeech) -> None:
        if self._current_speak_task and not self._current_speak_task.done():
            logger.info("Waiting for the previous speak task to finish.")
            await self._current_speak_task
            self._current_speak_task = None
            logger.info("Finished waiting for the previous speak task to finish.")

        logger.info(f"Speaking {speech}")
        self._current_speak_task = asyncio.create_task(self.speak_all(speech))
        self._current_speak_task.add_done_callback(
            (lambda task: logger.info(f"Speak task completed. {speech.character_id}"))
        )

    async def speak_all(self, speech: AgentSpeech) -> None:
        session = self._toolset.session
        for item in speech.speeches:
            logger.info(f"Speaking {item.text} with emotion {item.emotion}")
            try:
                await session.call_tool(
                    "speak",
                    arguments={
                        "message": item.text,
                        "character_id": speech.character_id,
                        "emotion": item.emotion,
                    },
                )
            except Exception as e:
                logger.error(f"Error in speak_all-call_tool: {e}", exc_info=True)
            finally:
                logger.info(f"Finished speaking {item.text} with emotion {item.emotion}")

    async def wait_for_current_speak_end(self) -> None:
        logger.info("Waiting for current speak task to finish.")
        if self._current_speak_task:
            await self._current_speak_task
            self._current_speak_task = None
            logger.info("Finished waiting for current speak task to finish.")

    async def aclose(self) -> None:
        logger.info("aclose")
        if self._exit_stack:
            await self._exit_stack.aclose()
