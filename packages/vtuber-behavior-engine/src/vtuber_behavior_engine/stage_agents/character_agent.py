#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from typing import Optional

from google.adk.agents import LlmAgent, BaseAgent
from google.adk.agents.callback_context import CallbackContext
from google.genai import types
from google.genai.types import Part

from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent_constants import (
    AGENT_LLM_MODEL,
    OUTPUT_LLM_MODEL,
    STATE_AGENT_SPEECH_BASE,
    STATE_DISPLAY_MARKDOWN_TEXT,
)
from vtuber_behavior_engine.stage_agents.models import AgentSpeech
from vtuber_behavior_engine.stage_agents.resources import character_prompt, character_output_prompt

logger = logging.getLogger(__name__)


def create_character_agent(character_id: str, character_detail: str) -> BaseAgent:
    agent = LlmAgent(
        model=AGENT_LLM_MODEL,
        name=character_id,
        instruction=character_prompt(character_id, character_detail),
        description=f"Character {character_id} agent",
        output_schema=AgentSpeech,
        output_key=STATE_AGENT_SPEECH_BASE + character_id,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
    )
    return agent


async def create_character_output_agent(character_id: str, stage_director_client: StageDirectorMCPClient) -> BaseAgent:
    async def handle_speech(callback_context: CallbackContext) -> Optional[types.Content]:
        markdown_text = callback_context.state[STATE_DISPLAY_MARKDOWN_TEXT]

        if STATE_AGENT_SPEECH_BASE + character_id not in callback_context.state:
            logger.info("No speech data found in state. skipping output.")
            return types.ModelContent(parts=[Part.from_text(text="Nothing to do.")])
        else:
            speech_data = callback_context.state[STATE_AGENT_SPEECH_BASE + character_id]
            logger.info(f"speak(): {speech_data}")
            speech_model = AgentSpeech.model_validate(speech_data)
            await stage_director_client.speak(speech_model, markdown_text)
            callback_context.state[STATE_AGENT_SPEECH_BASE + character_id] = None
            return None

    all_tools = await stage_director_client.load_tools()
    tools = list(filter(lambda tool: tool.name == "trigger_animation", all_tools))
    agent = LlmAgent(
        model=OUTPUT_LLM_MODEL,
        name=f"CharacterOutput_{character_id}",
        instruction=character_output_prompt(character_id),
        description=f"Character {character_id} output",
        tools=tools,
        before_agent_callback=handle_speech,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
    )
    return agent
