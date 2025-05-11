#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging

from google.adk.agents import LoopAgent, SequentialAgent, BaseAgent, ParallelAgent

from vtuber_behavior_engine.stage_agents.agent_constants import (
    AGENT1_CHARACTER_ID,
    AGENT2_CHARACTER_ID,
)
from vtuber_behavior_engine.stage_agents.character_agent import create_character_agent, create_character_output_agent
from vtuber_behavior_engine.stage_agents.conversation_context_agent import (
    create_initial_context_agent,
    create_update_context_agent,
    create_news_agent,
    create_current_time_agent,
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

    current_time_agent = create_current_time_agent()
    news_agent = create_news_agent()
    initial_context_agent = create_initial_context_agent()
    update_context_agent = create_update_context_agent()

    parallel1 = ParallelAgent(
        name="ParallelConversationAgent1",
        sub_agents=[
            agent2_output,
            agent1_thought,
        ],
        description="Handles the parallel execution of multiple agents.",
    )

    agent2_and_update = SequentialAgent(
        name="Agent2AndUpdate",
        sub_agents=[
            agent2_thought,
            update_context_agent,
        ],
        description="Handles the conversation and agent2 and context update.",
    )
    parallel2 = ParallelAgent(
        name="ParallelConversationAgent2",
        sub_agents=[
            agent1_output,
            agent2_and_update,
        ],
        description="Handles the parallel execution of multiple agents.",
    )

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=[parallel1, parallel2],
        max_iterations=5,
        description="Handles the conversation between two agents.",
    )

    root_agent = SequentialAgent(
        name="ConversationPipeline",
        sub_agents=[
            current_time_agent,
            news_agent,
            initial_context_agent,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
    )
    return root_agent
