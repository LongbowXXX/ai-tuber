#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from typing import Optional

from google.adk.agents import BaseAgent, LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_response import LlmResponse
from google.adk.tools import google_search
from google.genai import types

from vtuber_behavior_engine.services.current_time_provider import get_current_time
from vtuber_behavior_engine.services.news_provider import get_news
from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent_constants import (
    STATE_CONVERSATION_CONTEXT,
    STATE_CURRENT_TIME,
)
from vtuber_behavior_engine.stage_agents.display_utils import to_grounding_markdown_text
from vtuber_behavior_engine.stage_agents.news.news_agent_constants import (
    INITIAL_TOPIC_LLM_MODEL,
    UPDATE_TOPIC_LLM_MODEL,
    STATE_LATEST_NEWS,
)
from vtuber_behavior_engine.stage_agents.resources import (
    initial_news_context,
    update_news_context,
)

logger = logging.getLogger(__name__)


def create_initial_news_context_agent(stage_director_client: StageDirectorMCPClient) -> BaseAgent:
    def provide_news(callback_context: CallbackContext) -> Optional[types.Content]:
        news_data = get_news()
        callback_context.state[STATE_LATEST_NEWS] = news_data
        logger.info(f"provide_news(): {news_data}")
        callback_context.state[STATE_CURRENT_TIME] = get_current_time()
        return None

    async def after_model_callback(
        callback_context: CallbackContext,
        llm_response: LlmResponse,
    ) -> Optional[LlmResponse]:
        logger.info(f"after_model_callback(): {callback_context}, {llm_response}")
        if llm_response.grounding_metadata:
            logger.info(f"after_model_callback(): \n{llm_response.grounding_metadata.model_dump_json(indent=2)}")
            markdown = to_grounding_markdown_text(llm_response.grounding_metadata)
            if markdown:
                await stage_director_client.display_markdown_text(markdown)
        return None

    agent = LlmAgent(
        name="InitialContextProvider",
        model=INITIAL_TOPIC_LLM_MODEL,
        instruction=initial_news_context(),
        description="Provides the initial context for the conversation.",
        output_key=STATE_CONVERSATION_CONTEXT,
        tools=[google_search],
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
        before_agent_callback=provide_news,
        after_model_callback=after_model_callback,
    )
    return agent


def create_update_news_context_agent(stage_director_client: StageDirectorMCPClient) -> BaseAgent:
    async def after_model_callback(
        callback_context: CallbackContext,
        llm_response: LlmResponse,
    ) -> Optional[LlmResponse]:
        logger.info(f"after_model_callback(): {callback_context}, {llm_response}")
        if llm_response.grounding_metadata:
            logger.info(f"after_model_callback(): \n{llm_response.grounding_metadata.model_dump_json(indent=2)}")
            markdown = to_grounding_markdown_text(llm_response.grounding_metadata)
            if markdown:
                await stage_director_client.display_markdown_text(markdown)
        return None

    agent = LlmAgent(
        name="ContextUpdater",
        model=UPDATE_TOPIC_LLM_MODEL,
        instruction=update_news_context(),
        description="Updates the conversation context based on history.",
        output_key=STATE_CONVERSATION_CONTEXT,
        tools=[google_search],
        disallow_transfer_to_parent=True,
        disallow_transfer_to_peers=True,
        after_model_callback=after_model_callback,
    )
    return agent
