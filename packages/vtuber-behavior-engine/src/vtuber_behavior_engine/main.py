#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging
from contextlib import AsyncExitStack

from dotenv import load_dotenv

from vtuber_behavior_engine.agent_runner import run_agent_standalone
from vtuber_behavior_engine.stage_agents.resources import initial_message

logger = logging.getLogger(__name__)


async def main() -> None:
    from vtuber_behavior_engine.news_agent.agent import root_agent

    exit_stack: AsyncExitStack | None = None
    try:
        agent_tuple = await root_agent
        if agent_tuple is None:
            logger.error("Failed to create root agent.")
            raise Exception("Failed to create root agent.")
        character_agent, exit_stack = agent_tuple
        # initial message
        message = initial_message()
        await run_agent_standalone(character_agent, message)
    finally:
        if exit_stack is not None:
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
