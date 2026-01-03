#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging
from typing import Optional, cast

from google.adk.agents import LoopAgent, SequentialAgent, BaseAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.llm_agent import ToolUnion
from google.genai import types

from contextlib import AsyncExitStack
from vtuber_behavior_engine.services.speech_recognition import SpeechRecognitionTool
from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent_constants import (
    AGENT1_CHARACTER_ID,
    AGENT2_CHARACTER_ID,
)
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.character_agent import create_character_agent, create_character_output_agent
from vtuber_behavior_engine.stage_agents.conversation_context_agent import (
    create_conversation_recall_agent,
)
from vtuber_behavior_engine.stage_agents.resources import (
    character1,
    character2,
)

logger = logging.getLogger(__name__)


def build_root_agent(
    initial_context_agent: BaseAgent,
    update_context_agent: BaseAgent,
    stage_director_client: StageDirectorMCPClient,
    agent_config: AgentsConfig,
    exit_stack: AsyncExitStack,
    speech_tool: Optional[SpeechRecognitionTool] = None,
) -> BaseAgent:
    logger.info(f"Creating root agent. agent_config={agent_config}")
    agent1_thought = create_character_agent(AGENT1_CHARACTER_ID, character1(), speech_tool)
    agent2_thought = create_character_agent(AGENT2_CHARACTER_ID, character2(), speech_tool)

    agent1_output = create_character_output_agent(AGENT1_CHARACTER_ID, stage_director_client)
    agent2_output = create_character_output_agent(AGENT2_CHARACTER_ID, stage_director_client)

    recall_conversation_agent = create_conversation_recall_agent()

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=[
            recall_conversation_agent,
            agent1_thought,
            agent1_output,
            agent2_thought,
            agent2_output,
            update_context_agent,
        ],
        max_iterations=agent_config.max_iterations,
        description="Handles the conversation between two agents.",
    )

    async def teardown_root_agent(callback_context: CallbackContext) -> Optional[types.Content]:
        logger.debug(f"teardown_root_agent {callback_context.state}")
        await stage_director_client.wait_for_current_speak_end()
        await exit_stack.aclose()
        return None

    async def initialize_tools(callback_context: CallbackContext) -> Optional[types.Content]:
        if callback_context.state.get("is_tools_initialized"):
            return None
        logger.info("Initializing tools...")
        try:
            all_tools = await stage_director_client.load_tools()
            tools = list(
                filter(
                    lambda tool: tool.name in ["trigger_animation", "control_camera"],
                    all_tools,
                )
            )

            # Inject tools into output agents
            agent1_output.tools = cast(list[ToolUnion], tools)
            agent2_output.tools = cast(list[ToolUnion], tools)

            logger.info(f"Tools initialized and injected. Count: {len(tools)}")
            callback_context.state["is_tools_initialized"] = True
        except Exception as e:
            # Log with traceback and propagate to avoid silent failures and repeated retries.
            logger.exception(f"Failed to initialize tools: {e}")
            raise
        return None

    root_agent = SequentialAgent(
        name="ConversationPipeline",
        sub_agents=[
            initial_context_agent,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
        before_agent_callback=initialize_tools,
        after_agent_callback=teardown_root_agent,
    )
    logger.info(f"Root agent created: {root_agent}")
    return root_agent
