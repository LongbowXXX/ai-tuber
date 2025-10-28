#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging

from google.adk.agents import BaseAgent
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from vtuber_behavior_engine.services.memory.chroma_memory_service import ChromaMemoryService
from vtuber_behavior_engine.stage_agents.agent_constants import (
    AGENT_SYSTEM_AAP_NAME,
    AGENT_SYSTEM_USER_ID,
    AGENT1_CHARACTER_ID,
    AGENT2_CHARACTER_ID,
)

logger = logging.getLogger(__name__)


async def run_agent_standalone(agent: BaseAgent, initial_message: str) -> str:
    logger.info(f"Running agent with initial_message: '{initial_message}'")

    # Prepare to use ADK Runner
    session_service = InMemorySessionService()
    artifacts_service = InMemoryArtifactService()
    memory_service = ChromaMemoryService(
        event_filter=lambda event_data: event_data.author in [AGENT1_CHARACTER_ID, AGENT2_CHARACTER_ID],
    )
    # Convert user input into a format ADK can understand
    message = Content(role="user", parts=[Part(text=initial_message)])

    runner = Runner(
        app_name=AGENT_SYSTEM_AAP_NAME,
        agent=agent,
        session_service=session_service,
        artifact_service=artifacts_service,
        memory_service=memory_service,
    )
    session = await session_service.create_session(
        state={}, app_name=AGENT_SYSTEM_AAP_NAME, user_id=AGENT_SYSTEM_USER_ID
    )
    logger.info(f"Running agent with session: '{session}'")

    final_response = None
    # run_async returns an asynchronous iterator of events
    async for event in runner.run_async(session_id=session.id, user_id=session.user_id, new_message=message):
        # logger.info(f"\n\n-------------------\nAgent Event: \n{event}\n--------------------\n")

        if event.content and event.content.parts:
            final_response = event.content.parts[0].text

    logger.info(f"Agent final response: {final_response}")
    completed_session = await session_service.get_session(
        app_name=AGENT_SYSTEM_AAP_NAME, user_id=AGENT_SYSTEM_USER_ID, session_id=session.id
    )
    if completed_session:
        await memory_service.add_session_to_memory(completed_session)

    logger.info(f"Session added to memory: {completed_session}")
    return final_response or ""
