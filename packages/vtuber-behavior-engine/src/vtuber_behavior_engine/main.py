#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging

from dotenv import load_dotenv

from vtuber_behavior_engine.agent_runner import run_agent_standalone
from vtuber_behavior_engine.mcp_client import get_tools_async
from vtuber_behavior_engine.stage_agents.agent import create_root_agent

logger = logging.getLogger(__name__)


async def main() -> None:
    tools, exit_stack = await get_tools_async()
    try:
        character_agent = create_root_agent(tools)
        # Test query
        test_query = "Hello! How are you?"
        await run_agent_standalone(character_agent, test_query)
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
