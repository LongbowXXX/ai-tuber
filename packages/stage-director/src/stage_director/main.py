#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio
import logging

from stage_director.stage_director_mcp_server import run_stage_director_mcp_server
from stage_director.stage_director_server import run_stage_director_server


async def run_servers() -> None:
    """Run all servers."""
    await asyncio.gather(
        run_stage_director_server(),
        run_stage_director_mcp_server(),
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    asyncio.run(run_servers())
