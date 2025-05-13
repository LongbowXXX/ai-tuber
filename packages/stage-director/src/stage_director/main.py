#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio
import logging

from dotenv import load_dotenv

from stage_director.stage_director_mcp_server import run_stage_director_mcp_server
from stage_director.stage_director_server import run_stage_director_server

logger = logging.getLogger(__name__)


async def run_servers() -> None:
    """Run all servers."""
    await asyncio.gather(
        run_stage_director_server(),
        run_stage_director_mcp_server(),
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    load_dotenv()
    try:
        asyncio.run(run_servers())
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt: Exiting...")
