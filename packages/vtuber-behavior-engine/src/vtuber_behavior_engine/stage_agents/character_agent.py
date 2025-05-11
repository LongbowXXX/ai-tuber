#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from typing import Optional

from google.adk.agents import LlmAgent, BaseAgent
from google.adk.agents.callback_context import CallbackContext
from google.genai import types

from vtuber_behavior_engine.stage_agents.agent_constants import AGENT_LLM_MODEL, OUTPUT_LLM_MODEL, STATE_AGENT_SPEECH
from vtuber_behavior_engine.stage_agents.models import AgentSpeech
from vtuber_behavior_engine.stage_agents.resources import character_prompt, character_output_prompt
from vtuber_behavior_engine.stage_director_mcp_client import StageDirectorMCPClient


def create_character_agent(character_id: str, character_detail: str) -> BaseAgent:
    agent = LlmAgent(
        model=AGENT_LLM_MODEL,
        name=character_id,
        instruction=character_prompt(character_id, character_detail),
        description=f"Character {character_id} agent",
        output_schema=AgentSpeech,
        output_key=STATE_AGENT_SPEECH,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
    )
    return agent


def create_character_output_agent(character_id: str, stage_director_client: StageDirectorMCPClient) -> BaseAgent:
    async def speak(callback_context: CallbackContext) -> Optional[types.Content]:
        # context.user_content
        speech_data = callback_context.state[STATE_AGENT_SPEECH]
        speech_model = AgentSpeech.model_validate(speech_data)
        await stage_director_client.speak(speech_model)
        return None

    agent = LlmAgent(
        model=OUTPUT_LLM_MODEL,
        name=f"CharacterOutput_{character_id}",
        instruction=character_output_prompt(),
        description=f"Character {character_id} output",
        tools=stage_director_client.tools,
        after_agent_callback=speak,
    )
    return agent
