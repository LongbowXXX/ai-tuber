#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging

from google.adk.agents import LoopAgent, SequentialAgent, BaseAgent

from vtuber_behavior_engine.stage_agents.agent_constants import (
    AGENT1_CHARACTER_ID,
    AGENT2_CHARACTER_ID,
)
from vtuber_behavior_engine.stage_agents.character_agent import create_character_agent, create_character_output_agent
from vtuber_behavior_engine.stage_agents.conversation_context_agent import (
    create_initial_context_agent,
    create_update_context_agent,
)
from vtuber_behavior_engine.stage_agents.resources import (
    character1,
    character2,
)
from vtuber_behavior_engine.stage_director_mcp_client import StageDirectorMCPClient

logger = logging.getLogger(__name__)


def create_root_agent(stage_director_client: StageDirectorMCPClient) -> BaseAgent:

    agent1_thought = create_character_agent(AGENT1_CHARACTER_ID, character1())
    agent2_thought = create_character_agent(AGENT2_CHARACTER_ID, character2())

    agent1_output = create_character_output_agent(AGENT1_CHARACTER_ID, stage_director_client)
    agent2_output = create_character_output_agent(AGENT2_CHARACTER_ID, stage_director_client)

    initial_context_agent = create_initial_context_agent()
    update_context_agent = create_update_context_agent()

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=[
            agent1_thought,
            agent1_output,
            agent2_thought,
            agent2_output,
            update_context_agent,
        ],
        max_iterations=5,
        description="Handles the conversation between two agents.",
    )

    root_agent = SequentialAgent(
        name="ConversationPipeline",
        sub_agents=[
            initial_context_agent,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
    )
    return root_agent
