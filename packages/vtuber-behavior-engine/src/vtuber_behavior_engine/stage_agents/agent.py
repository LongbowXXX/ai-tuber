#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging

from google.adk.agents import LlmAgent, LoopAgent, SequentialAgent, BaseAgent
from google.adk.tools import google_search
from google.adk.tools.mcp_tool import MCPTool

from vtuber_behavior_engine.stage_agents.agent_constants import (
    AGENT_LLM_MODEL,
    OUTPUT_LLM_MODEL,
    INITIAL_TOPIC_LLM_MODEL,
    UPDATE_TOPIC_LLM_MODEL,
)
from vtuber_behavior_engine.stage_agents.models import AgentSpeech
from vtuber_behavior_engine.stage_agents.resources import (
    initial_context,
    update_context,
    character_prompt,
    character1,
    character2,
    character_output_prompt,
)

# --- State Keys ---
STATE_CONVERSATION_CONTEXT = "conversation_context"
AGENT1_CHARACTER_ID = "avatar1"
AGENT2_CHARACTER_ID = "avatar2"
STATE_AGENT_SPEECH = "agent_speech"

logger = logging.getLogger(__name__)


def create_root_agent(character_tools: list[MCPTool]) -> BaseAgent:
    """Create the root agent for the iterative refinement process."""
    # Create the tools and exit stack
    logger.info("Creating tools...")

    # Create LlmAgent
    agent1 = LlmAgent(
        model=AGENT_LLM_MODEL,
        name=AGENT1_CHARACTER_ID,  # Agent name
        # Agent instructions (persona and task)
        instruction=character_prompt(AGENT1_CHARACTER_ID, character1()),
        description=f"Character {AGENT1_CHARACTER_ID} agent",
        output_schema=AgentSpeech,
        output_key=STATE_AGENT_SPEECH,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
    )

    # Create LlmAgent
    agent2 = LlmAgent(
        model=AGENT_LLM_MODEL,
        name=AGENT2_CHARACTER_ID,  # Agent name
        # Agent instructions (persona and task)
        instruction=character_prompt(AGENT2_CHARACTER_ID, character2()),
        description=f"Character {AGENT2_CHARACTER_ID} agent",
        output_schema=AgentSpeech,
        output_key=STATE_AGENT_SPEECH,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
    )

    agent1_output = LlmAgent(
        model=OUTPUT_LLM_MODEL,
        name="CharacterOutput1",
        instruction=character_output_prompt(),
        description="Character agent1 output",
        tools=character_tools,
    )
    agent2_output = LlmAgent(
        model=OUTPUT_LLM_MODEL,
        name="CharacterOutput2",
        instruction=character_output_prompt(),
        description="Character agent2 output",
        tools=character_tools,
    )

    initial_context_agent_in_loop = LlmAgent(
        name="InitialContextProvider",
        model=INITIAL_TOPIC_LLM_MODEL,
        include_contents="none",
        instruction=initial_context(),
        description="Provides the initial context for the conversation.",
        output_key=STATE_CONVERSATION_CONTEXT,
        tools=[google_search],
    )

    context_agent_in_loop = LlmAgent(
        name="ContextUpdater",
        model=UPDATE_TOPIC_LLM_MODEL,
        instruction=update_context(),
        description="Updates the conversation context based on history.",
        output_key=STATE_CONVERSATION_CONTEXT,
        tools=[google_search],
    )

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
            initial_context_agent_in_loop,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
        # The root agent will be the one to return the final result
    )
    return root_agent
