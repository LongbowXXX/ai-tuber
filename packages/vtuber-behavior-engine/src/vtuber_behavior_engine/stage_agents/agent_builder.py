#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging
from typing import Optional

from google.adk.agents import LoopAgent, SequentialAgent, BaseAgent
from google.adk.agents.callback_context import CallbackContext
from google.genai import types

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
from vtuber_behavior_engine.stage_agents.news.news_context_agent import (
    create_initial_news_context_agent,
    create_update_news_context_agent,
)
from vtuber_behavior_engine.stage_agents.resources import (
    character1,
    character2,
)

logger = logging.getLogger(__name__)


async def build_root_agent(
    initial_context_agent: BaseAgent,
    update_context_agent: BaseAgent,
    stage_director_client: StageDirectorMCPClient,
    agent_config: AgentsConfig,
) -> BaseAgent:
    logger.info(f"Creating root agent. agent_config={agent_config}")
    agent1_thought = create_character_agent(AGENT1_CHARACTER_ID, character1())
    agent2_thought = create_character_agent(AGENT2_CHARACTER_ID, character2())

    agent1_output = await create_character_output_agent(AGENT1_CHARACTER_ID, stage_director_client)
    agent2_output = await create_character_output_agent(AGENT2_CHARACTER_ID, stage_director_client)

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
        return None

    root_agent = SequentialAgent(
        name="ConversationPipeline",
        sub_agents=[
            initial_context_agent,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
        after_agent_callback=teardown_root_agent,
    )
    logger.info(f"Root agent created: {root_agent}")
    return root_agent
