#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging

from mcp import ClientSession
from mcp.client.sse import sse_client

logger = logging.getLogger(__name__)


async def connect() -> None:
    """Connect to the SSE server and initialize the client session."""
    # Create an SSE client and connect to the server
    async with sse_client("http://localhost:8080/sse") as streams:
        async with ClientSession(streams[0], streams[1]) as session:
            await session.initialize()
            tools_result = await session.list_tools()
            logger.info(f"{tools_result.tools}")
