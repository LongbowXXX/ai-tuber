#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging
import os
from asyncio import Task
from contextlib import AsyncExitStack

from google.adk.tools.mcp_tool import MCPToolset, MCPTool
from google.adk.tools.mcp_tool.mcp_session_manager import SseServerParams

from vtuber_behavior_engine.stage_agents.models import AgentSpeech

logger = logging.getLogger(__name__)
STAGE_DIRECTOR_MCP_SERVER_URL = os.getenv("STAGE_DIRECTOR_MCP_SERVER_URL")


class StageDirectorMCPClient:
    @classmethod
    async def create_async(cls, async_exit_stack: AsyncExitStack) -> "StageDirectorMCPClient":
        logger.info("create_async")
        if not STAGE_DIRECTOR_MCP_SERVER_URL:
            logger.error("STAGE_DIRECTOR_MCP_SERVER_URL is not set.")
            raise ValueError("STAGE_DIRECTOR_MCP_SERVER_URL is not set.")

        toolset = MCPToolset(
            connection_params=SseServerParams(
                url=STAGE_DIRECTOR_MCP_SERVER_URL,
            ),
            exit_stack=async_exit_stack,
        )
        await async_exit_stack.enter_async_context(toolset)
        return cls(toolset)

    def __init__(self, toolset: MCPToolset) -> None:
        logger.info("__init__")
        self._toolset = toolset
        self._current_speak_task: Task[None] | None = None

    async def load_tools(self) -> list[MCPTool]:
        logger.info("tools")
        return await self._toolset.load_tools()  # type: ignore[no-any-return]

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
            logger.info(f"Speaking {item.tts_text} with emotion {item.emotion}")
            try:
                await session.call_tool(
                    "speak",
                    arguments={
                        "message": item.tts_text,
                        "caption": item.caption if item.caption else item.tts_text,
                        "character_id": speech.character_id,
                        "emotion": item.emotion,
                    },
                )
            except Exception as e:
                logger.error(f"Error in speak_all-call_tool: {e}", exc_info=True)
            finally:
                logger.info(f"Finished speaking {item.tts_text} with emotion {item.emotion}")

    async def wait_for_current_speak_end(self) -> None:
        logger.info("Waiting for current speak task to finish.")
        if self._current_speak_task:
            await self._current_speak_task
            self._current_speak_task = None
            logger.info("Finished waiting for current speak task to finish.")
