#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from contextlib import AsyncExitStack

from google.adk.agents import BaseAgent

from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent import create_root_agent
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig

logger = logging.getLogger(__name__)


async def create_root_agent_for_adk_web(agent_config: AgentsConfig) -> tuple[BaseAgent, AsyncExitStack] | None:
    logger.info(f"Creating root agent. agent_config={agent_config}")
    stage_director_client = await StageDirectorMCPClient.create_async()
    common_exit_stack = AsyncExitStack()
    common_exit_stack.callback(stage_director_client.aclose)
    try:
        character_agent = create_root_agent(stage_director_client, agent_config)
        return character_agent, common_exit_stack
    except Exception as e:
        logger.error(f"Error creating root agent: {e}", exc_info=e)
        raise


root_agent = create_root_agent_for_adk_web(
    AgentsConfig(
        max_iterations=5,
    )
)
