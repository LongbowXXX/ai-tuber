#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging
from contextlib import AsyncExitStack

from google.adk.agents import BaseAgent

from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent_builder import build_root_agent
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.presentation.presentation_context_agent import (
    create_initial_presentation_context_agent,
    create_update_presentation_context_agent,
)

logger = logging.getLogger(__name__)


async def build_root_presentation_agent(agent_config: AgentsConfig) -> tuple[BaseAgent, AsyncExitStack] | None:
    logger.info(f"Building root agent. agent_config={agent_config}")
    exit_stack = AsyncExitStack()
    stage_director_client = await StageDirectorMCPClient.create_async(exit_stack)
    exit_stack.callback(lambda: logger.info("build_root_presentation_agent(): exit_stack closed."))
    try:
        initial_context_agent = create_initial_presentation_context_agent()
        update_context_agent = create_update_presentation_context_agent()
        character_agent = await build_root_agent(
            initial_context_agent, update_context_agent, stage_director_client, agent_config
        )
        return character_agent, exit_stack
    except Exception as e:
        logger.error(f"Error building root agent: {e}", exc_info=e)
        raise
