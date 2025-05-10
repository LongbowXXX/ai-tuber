#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from xml.etree import ElementTree

import requests
from google.adk.agents import BaseAgent, LlmAgent
from google.adk.tools import google_search
from google.adk.tools.load_web_page import load_web_page

from vtuber_behavior_engine.stage_agents.agent_constants import (
    INITIAL_TOPIC_LLM_MODEL,
    STATE_CONVERSATION_CONTEXT,
    UPDATE_TOPIC_LLM_MODEL,
    STATE_LATEST_NEWS,
)
from vtuber_behavior_engine.stage_agents.resources import initial_context, update_context, latest_news_prompt

logger = logging.getLogger(__name__)


def get_news() -> dict[str, str]:
    """
    A function that retrieves the latest news from a Google News RSS feed.
    Returns:
        str: A string containing the latest news headlines and links for the specified topic.
    """
    # 　Topic ["WORLD", "NATION", "BUSINESS", "TECHNOLOGY", "ENTERTAINMENT", "SPORTS", "SCIENCE", "HEALTH"]
    url = "https://news.google.com/news/rss/headlines/section/topic/WORLD?hl=ja&gl=JP&ceid=JP:ja"
    try:
        response = requests.get(url)
        response.raise_for_status()
        root = ElementTree.fromstring(response.content)
        news_items = []
        for item in root.findall(".//item"):
            title = item.find("title").text
            news_items.append(f"{title}")
        result = "\n".join(news_items[:5])
        logger.info(f"get_news(): Latest news {result}")
        return {"status": "success", "news": result}
    except Exception as e:
        logger.error(f"get_news(): {e}", exc_info=e)
        return {"status": "failed", "error_message": f"Get news failed.: {e}"}


def create_news_agent() -> BaseAgent:
    """
    Creates a news-agent that retrieves the latest news for a specified topic.
    Returns:
        BaseAgent: The news-agent.
    """
    agent = LlmAgent(
        name="NewsAgent",
        model=INITIAL_TOPIC_LLM_MODEL,
        instruction=latest_news_prompt(),
        description="Retrieves the latest news",
        output_key=STATE_LATEST_NEWS,
        tools=[get_news, load_web_page],
    )
    return agent


def create_initial_context_agent() -> BaseAgent:
    agent = LlmAgent(
        name="InitialContextProvider",
        model=INITIAL_TOPIC_LLM_MODEL,
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
