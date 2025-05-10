#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging

from google.adk.agents import LoopAgent, SequentialAgent, BaseAgent
from google.adk.tools.mcp_tool import MCPTool

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

logger = logging.getLogger(__name__)


def create_root_agent(character_tools: list[MCPTool]) -> BaseAgent:

    agent1 = create_character_agent(AGENT1_CHARACTER_ID, character1())
    agent2 = create_character_agent(AGENT2_CHARACTER_ID, character2())

    agent1_output = create_character_output_agent(AGENT1_CHARACTER_ID, character_tools)
    agent2_output = create_character_output_agent(AGENT2_CHARACTER_ID, character_tools)

    current_time_agent = create_current_time_agent()
    news_agent = create_news_agent()
    initial_context_agent = create_initial_context_agent()
    context_agent_in_loop = create_update_context_agent()

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=[
            agent1,
            agent1_output,
            agent2,
            agent2_output,
            context_agent_in_loop,
        ],
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
