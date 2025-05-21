#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

from google.adk.agents import BaseAgent, LlmAgent
from google.adk.tools import load_memory

from vtuber_behavior_engine.stage_agents.agent_constants import (
    STATE_CONVERSATION_RECALL,
    CONVERSATION_RECALL_LLM_MODEL,
)
from vtuber_behavior_engine.stage_agents.resources import (
    recall_conversation_prompt,
)


def create_conversation_recall_agent() -> BaseAgent:

    agent = LlmAgent(
        name="ConversationRecall",
        model=CONVERSATION_RECALL_LLM_MODEL,
        instruction=recall_conversation_prompt(),
        description="Recall past conversations related to the current one.",
        output_key=STATE_CONVERSATION_RECALL,
        tools=[load_memory],
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
    )
    return agent
