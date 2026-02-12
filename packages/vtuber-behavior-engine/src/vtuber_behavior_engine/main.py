#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging


from dotenv import load_dotenv

from vtuber_behavior_engine.agent_runner import run_agent_standalone
from vtuber_behavior_engine.stage_agents.resources import initial_message
from vtuber_behavior_engine.utils.logger import setup_logger

logger = logging.getLogger(__name__)


async def main() -> None:
    from vtuber_behavior_engine.news_agent.agent import root_agent
    from vtuber_behavior_engine.config_loader import load_config

    # Load configuration (defaulting to news config for now, or could be argument based)
    config = load_config("news_config.yaml")

    character_agent = root_agent
    if character_agent is None:
        logger.error("Failed to create root agent.")
        raise Exception("Failed to create root agent.")

    # initial message
    message = initial_message()
    character_ids = [c.id for c in config.characters]
    await run_agent_standalone(character_agent, message, character_ids)


if __name__ == "__main__":
    setup_logger()
    load_dotenv()  # Load environment variables from .env file

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt: Exiting...")
    except ValueError as e:
        logger.error("run ValueError", exc_info=e)
    except Exception as e:
        logger.exception("run unexpected error occurred", exc_info=e)
