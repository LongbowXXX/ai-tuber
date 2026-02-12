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

from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.character_agent import create_character_agent, create_character_output_agent
from vtuber_behavior_engine.stage_agents.conversation_context_agent import (
    create_conversation_recall_agent,
)
from vtuber_behavior_engine.stage_agents.resources import (
    load_character_xml,
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

    thought_agents = []
    output_agents = []

    available_character_ids = [c.id for c in agent_config.characters]

    for char_config in agent_config.characters:
        prompt_content = load_character_xml(char_config.prompt_file)
        # Create thought agent
        thought_agent = create_character_agent(char_config.id, prompt_content, speech_tool)
        thought_agents.append(thought_agent)

        # Create output agent
        output_agent = create_character_output_agent(
            char_config.id,
            stage_director_client,
            available_character_ids,
        )
        output_agents.append(output_agent)

    recall_conversation_agent = create_conversation_recall_agent()

    # Construct sub_agents list for LoopAgent
    # Order: recall, [thought1, output1, thought2, output2...], update_context
    loop_sub_agents = [recall_conversation_agent]
    for thought, output in zip(thought_agents, output_agents):
        loop_sub_agents.append(thought)
        loop_sub_agents.append(output)
    loop_sub_agents.append(update_context_agent)

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=loop_sub_agents,
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
            for output_agent in output_agents:
                output_agent.tools = cast(list[ToolUnion], tools)

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
