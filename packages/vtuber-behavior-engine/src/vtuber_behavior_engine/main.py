#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging
from contextlib import AsyncExitStack

from dotenv import load_dotenv

from vtuber_behavior_engine.agent_runner import run_agent_standalone
from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.agent import create_root_agent
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.resources import initial_message

logger = logging.getLogger(__name__)


async def main() -> None:
    exit_stack = AsyncExitStack()
    stage_director_client = await StageDirectorMCPClient.create_async(exit_stack)
    try:
        character_agent = await create_root_agent(
            stage_director_client,
            AgentsConfig(
                max_iterations=5,
            ),
        )
        # initial message
        message = initial_message()
        await run_agent_standalone(character_agent, message)
    finally:
        await exit_stack.aclose()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    load_dotenv()  # Load environment variables from .env file

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt: Exiting...")
    except ValueError as e:
        logger.error("run ValueError", exc_info=e)
    except Exception as e:
        logger.exception("run unexpected error occurred", exc_info=e)
