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
from collections.abc import Iterable
from contextlib import AsyncExitStack
from typing import cast

from google.adk.tools.base_tool import BaseTool
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import SseServerParams, MCPSessionManager

from vtuber_behavior_engine.stage_agents.models import AgentSpeech

logger = logging.getLogger(__name__)
STAGE_DIRECTOR_MCP_SERVER_URL = os.getenv("STAGE_DIRECTOR_MCP_SERVER_URL")


class StageDirectorMCPClient:
    @classmethod
    def create(cls, async_exit_stack: AsyncExitStack) -> "StageDirectorMCPClient":
        logger.info("create")
        if not STAGE_DIRECTOR_MCP_SERVER_URL:
            logger.error("STAGE_DIRECTOR_MCP_SERVER_URL is not set.")
            raise ValueError("STAGE_DIRECTOR_MCP_SERVER_URL is not set.")
        connection_params = SseServerParams(
            url=STAGE_DIRECTOR_MCP_SERVER_URL,
        )
        toolset = McpToolset(
            connection_params=connection_params,
            require_confirmation=False,
        )
        async_exit_stack.push_async_callback(toolset.close)
        mcp_session_manager = MCPSessionManager(
            connection_params=connection_params,
        )
        return cls(toolset, mcp_session_manager)

    def __init__(self, toolset: McpToolset, mcp_session_manager: MCPSessionManager) -> None:
        logger.info("__init__")
        self._toolset = toolset
        self._mcp_session_manager = mcp_session_manager
        self._current_speak_task: Task[None] | None = None

    async def load_tools(self) -> list[BaseTool]:
        logger.info("tools")
        try:
            tools = await self._toolset.get_tools()
            return list(cast(Iterable[BaseTool], tools))
        except Exception as e:
            logger.warning(f"Failed to load tools from MCP server: {e}. Running without MCP tools.")
            return []

    async def display_markdown_text(self, text: str) -> None:
        logger.info(f"Displaying markdown text: {text}")
        try:
            session = await self._mcp_session_manager.create_session()
            await session.call_tool(
                "display_markdown_text",
                arguments={
                    "text": text,
                },
            )
        except Exception as e:
            logger.error(f"Error in display_markdown_text: {e}")
        finally:
            logger.info("Finished displaying markdown text.")

    async def speak(self, speech: AgentSpeech, markdown_text: str | None) -> None:
        if self._current_speak_task and not self._current_speak_task.done():
            logger.info("Waiting for the previous speak task to finish.")
            await self._current_speak_task
            self._current_speak_task = None
            logger.info("Finished waiting for the previous speak task to finish.")

        logger.info(f"Speaking {speech}")
        if markdown_text is not None:
            await self.display_markdown_text(markdown_text)
        self._current_speak_task = asyncio.create_task(self.speak_all(speech))
        self._current_speak_task.add_done_callback(
            (lambda task: logger.info(f"Speak task completed. {speech.character_id}"))
        )

    async def speak_all(self, speech: AgentSpeech) -> None:
        try:
            session = await self._mcp_session_manager.create_session()
        except Exception as e:
            logger.error(f"Failed to create MCP session for speaking: {e}")
            return

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
                logger.error(f"Error in speak_all-call_tool: {e}")
            finally:
                logger.info(f"Finished speaking {item.tts_text} with emotion {item.emotion}")

    async def wait_for_current_speak_end(self) -> None:
        logger.info("Waiting for current speak task to finish.")
        if self._current_speak_task:
            await self._current_speak_task
            self._current_speak_task = None
            logger.info("Finished waiting for current speak task to finish.")
