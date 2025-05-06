#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging

from google.adk.agents import BaseAgent
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Agent Execution Logic (for standalone testing) ---
async def run_agent_standalone(agent: BaseAgent, user_query: str) -> str:
    """Runs the agent with a single query for testing."""
    logger.info(f"Running agent with query: '{user_query}'")

    # Prepare to use ADK Runner
    session_service = InMemorySessionService()
    artifacts_service = InMemoryArtifactService()
    # Convert user input into a format ADK can understand
    message = Content(role="user", parts=[Part(text=user_query)])

    app_name = "standalone_test"
    user_id = "test_user"

    runner = Runner(
        app_name=app_name,
        agent=agent,
        session_service=session_service,
        artifact_service=artifacts_service,
    )
    session = session_service.create_session(state={}, app_name=app_name, user_id=user_id)
    logger.info(f"Running agent with session: '{session}'")

    final_response = None
    # run_async returns an asynchronous iterator of events
    async for event in runner.run_async(session_id=session.id, user_id=session.user_id, new_message=message):
        logger.info(f"\n\n-------------------\nAgent Event: \n{event}\n--------------------\n")
        await asyncio.sleep(1.5)

        if event.content and event.content.parts:
            final_response = event.content.parts[0].text

    logger.info(f"Agent final response: {final_response}")
    return final_response or ""
