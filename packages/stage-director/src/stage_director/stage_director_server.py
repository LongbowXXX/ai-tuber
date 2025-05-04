#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import logging
from fastapi import FastAPI
from uvicorn import Config, Server

from stage_director.websocket_handler import websocket_endpoint

logger = logging.getLogger("stage-director")

app = FastAPI(title="AI VTuber Stage Director", version="0.1.0")

# Register the WebSocket endpoint
app.add_api_websocket_route("/ws", websocket_endpoint)


# --- HTTP Endpoints (Optional for testing/health check) ---
@app.get("/")
async def read_root() -> dict[str, str]:
    """Basic HTTP endpoint for health check or info."""
    return {"message": "Stage Director is running"}


async def run_stage_director_server() -> None:
    """Run the Stage Director server."""

    # サーバー設定

    config = Config(
        "stage_director.stage_director_server:app", host="127.0.0.1", port=8000, log_level="info", reload=True
    )
    server = Server(config)

    logger.info("Starting Stage Director server with Uvicorn...")
    # サーバーを実行
    await server.serve()
