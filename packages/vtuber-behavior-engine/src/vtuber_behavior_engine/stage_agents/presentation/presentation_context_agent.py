#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from typing import Optional

from google.adk.agents import BaseAgent, LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_response import LlmResponse
from google.genai import types

from vtuber_behavior_engine.services.current_time_provider import get_current_time
from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent_constants import (
    STATE_CONVERSATION_CONTEXT,
    STATE_CURRENT_TIME,
)
from vtuber_behavior_engine.stage_agents.presentation.presentation_agent_constants import (
    STATE_PRESENTATION_ALL_DATA,
    UPDATE_PRESENTATION_LLM_MODEL,
    INITIAL_PRESENTATION_LLM_MODEL,
)
from vtuber_behavior_engine.stage_agents.presentation.presentation_models import PresentationContext, PresentationAll
from vtuber_behavior_engine.stage_agents.resources import (
    update_presentation_context,
    initial_presentation_context,
    use_ai_presentation_json,
)

logger = logging.getLogger(__name__)


def create_initial_presentation_context_agent(stage_director_client: StageDirectorMCPClient) -> BaseAgent:
    def provide_presentation(callback_context: CallbackContext) -> Optional[types.Content]:
        presentation_json = use_ai_presentation_json()
        callback_context.state[STATE_PRESENTATION_ALL_DATA] = PresentationAll.model_validate_json(presentation_json)
        logger.info(f"provide_presentation(): {presentation_json}")
        callback_context.state[STATE_CURRENT_TIME] = get_current_time()
        return None

    async def after_model_callback(
        callback_context: CallbackContext,
        llm_response: LlmResponse,
    ) -> Optional[LlmResponse]:
        logger.info(f"after_model_callback(): {callback_context}, {llm_response}")
        if llm_response.content.parts and llm_response.content.parts[0].text:
            context_json = llm_response.content.parts[0].text
            presentation_context = PresentationContext.model_validate_json(context_json)
            logger.info(f"after_model_callback(): \n{context_json}")
            await stage_director_client.display_markdown_text(presentation_context.current_slide.content_markdown)
        return None

    agent = LlmAgent(
        name="InitialContextProvider",
        model=INITIAL_PRESENTATION_LLM_MODEL,
        instruction=initial_presentation_context(),
        description="Provides the initial context for the conversation.",
        output_key=STATE_CONVERSATION_CONTEXT,
        output_schema=PresentationContext,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
        before_agent_callback=provide_presentation,
        after_model_callback=after_model_callback,
    )
    return agent


def create_update_presentation_context_agent(stage_director_client: StageDirectorMCPClient) -> BaseAgent:
    async def after_model_callback(
        callback_context: CallbackContext,
        llm_response: LlmResponse,
    ) -> Optional[LlmResponse]:
        logger.info(f"after_model_callback(): {callback_context}, {llm_response}")
        if llm_response.content.parts and llm_response.content.parts[0].text:
            context_json = llm_response.content.parts[0].text
            presentation_context = PresentationContext.model_validate_json(context_json)
            logger.info(f"after_model_callback(): \n{context_json}")
            await stage_director_client.display_markdown_text(presentation_context.current_slide.content_markdown)
        return None

    agent = LlmAgent(
        name="ContextUpdater",
        model=UPDATE_PRESENTATION_LLM_MODEL,
        instruction=update_presentation_context(),
        description="Updates the conversation context based on history.",
        output_key=STATE_CONVERSATION_CONTEXT,
        output_schema=PresentationContext,
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
        after_model_callback=after_model_callback,
    )
    return agent
