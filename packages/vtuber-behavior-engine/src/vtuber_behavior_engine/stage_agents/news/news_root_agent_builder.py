#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging
from contextlib import AsyncExitStack

from google.adk.agents import BaseAgent

from vtuber_behavior_engine.services.speech_recognition import (
    SpeechRecognitionTool,
    DummySpeechRecognitionTool,
)
from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent_builder import build_root_agent
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.news.news_context_agent import (
    create_initial_news_context_agent,
    create_update_news_context_agent,
)

logger = logging.getLogger(__name__)


def build_root_news_agent(agent_config: AgentsConfig) -> BaseAgent | None:
    logger.info(f"Building root agent. agent_config={agent_config}")
    exit_stack = AsyncExitStack()
    stage_director_client = StageDirectorMCPClient.create(exit_stack)
    exit_stack.callback(lambda: logger.info("build_root_news_agent(): exit_stack closed."))

    # 音声認識ツールの初期化
    if agent_config.use_speech_recognition:
        logger.info("Speech recognition is enabled.")
        speech_tool = SpeechRecognitionTool()
    else:
        logger.info("Speech recognition is disabled. Using DummySpeechRecognitionTool.")
        speech_tool = DummySpeechRecognitionTool()

    # 音声認識を開始
    speech_tool.start_recognition()
    exit_stack.callback(speech_tool.stop_recognition)

    try:
        initial_context_agent = create_initial_news_context_agent()
        update_context_agent = create_update_news_context_agent(speech_tool)
        character_agent = build_root_agent(
            initial_context_agent, update_context_agent, stage_director_client, agent_config, exit_stack, speech_tool
        )
        return character_agent
    except Exception as e:
        logger.error(f"Error building root agent: {e}", exc_info=e)
        raise
