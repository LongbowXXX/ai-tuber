#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from google.adk.agents import BaseAgent, LlmAgent
from google.adk.tools import google_search

from vtuber_behavior_engine.stage_agents.agent_constants import INITIAL_TOPIC_LLM_MODEL, STATE_CONVERSATION_CONTEXT, \
    UPDATE_TOPIC_LLM_MODEL
from vtuber_behavior_engine.stage_agents.resources import initial_context, update_context


def create_initial_context_agent() -> BaseAgent:
    agent = LlmAgent(
        name="InitialContextProvider",
        model=INITIAL_TOPIC_LLM_MODEL,
        include_contents="none",
        instruction=initial_context(),
        description="Provides the initial context for the conversation.",
        output_key=STATE_CONVERSATION_CONTEXT,
        tools=[google_search],
    )
    return agent

def create_update_context_agent() -> BaseAgent:
    agent = LlmAgent(
        name="ContextUpdater",
        model=UPDATE_TOPIC_LLM_MODEL,
        instruction=update_context(),
        description="Updates the conversation context based on history.",
        output_key=STATE_CONVERSATION_CONTEXT,
        tools=[google_search],
    )
    return agent
