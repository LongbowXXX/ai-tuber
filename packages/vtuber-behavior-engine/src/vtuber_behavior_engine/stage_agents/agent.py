#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging

from google.adk.agents import LlmAgent, LoopAgent, SequentialAgent, BaseAgent
from google.adk.tools.mcp_tool import MCPTool

from vtuber_behavior_engine.stage_agents.agent_constants import (
    GEMINI_MODEL,
)
from vtuber_behavior_engine.stage_agents.resources import initial_topic, update_topic, character_prompt

# --- State Keys ---
STATE_CURRENT_TOPIC = "current_topic"

logger = logging.getLogger(__name__)


def create_root_agent(character_tools: list[MCPTool]) -> BaseAgent:
    """Create the root agent for the iterative refinement process."""
    # Create the tools and exit stack
    logger.info("Creating tools...")

    logger.info("Creating Character Agent 1...")
    # Create LlmAgent
    agent1 = LlmAgent(
        model="gemini-2.0-flash",
        name="avatar1",  # Agent name
        # Agent instructions (persona and task)
        instruction=character_prompt("avatar1"),
        tools=character_tools,
        description="Character avatar1 agent",
    )
    logger.info("Character Agent 1 created.")

    logger.info("Creating Character Agent 2...")
    # Create LlmAgent
    agent2 = LlmAgent(
        model="gemini-2.0-flash",
        name="avatar2",  # Agent name
        # Agent instructions (persona and task)
        instruction=character_prompt("avatar2"),
        tools=character_tools,
        description="Character avatar2 agent",
    )
    logger.info("Character Agent 2 created.")

    initial_topic_agent_in_loop = LlmAgent(
        name="InitialTopicProvider",
        model=GEMINI_MODEL,
        # Relies solely on state via placeholders
        include_contents="none",
        instruction=initial_topic(),
        description="Provides the initial topic for the conversation.",
        output_key=STATE_CURRENT_TOPIC,
    )

    topic_agent_in_loop = LlmAgent(
        name="TopicUpdater",
        model=GEMINI_MODEL,
        instruction=update_topic(),
        description="Updates the current topic based on conversation history.",
        output_key=STATE_CURRENT_TOPIC,
    )

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=[
            agent1,
            agent2,
            topic_agent_in_loop,
        ],
        max_iterations=3,
        description="Handles the conversation between two agents.",
    )

    root_agent = SequentialAgent(
        name="ConversationPipeline",
        sub_agents=[
            initial_topic_agent_in_loop,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
    )
    return root_agent
