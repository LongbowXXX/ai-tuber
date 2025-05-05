#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging

from google.adk.agents.llm_agent import LlmAgent
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.mcp_tool import MCPTool
from google.genai.types import Content, Part

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Character Agent Definition ---
def create_character_agent(tools: list[MCPTool]) -> LlmAgent:
    """Creates a simple character agent instance."""
    logger.info("Creating Character Agent A...")
    # Create LlmAgent
    agent = LlmAgent(
        model="gemini-2.0-flash",
        name="avatar1",  # Agent name
        # Agent instructions (persona and task)
        instruction="""You are Character avatar1, a bright and cheerful virtual talent.
Please respond naturally and concisely to user input.
Your responses will be used directly in conversation.
Depending on what you want to say, choose the appropriate facial expression and must call set_expression.
""",
        tools=tools,
    )
    logger.info("Character Agent A created.")
    return agent


# --- Agent Execution Logic (for standalone testing) ---
async def run_agent_standalone(agent: LlmAgent, user_query: str) -> str:
    """Runs the agent with a single query for testing."""
    logger.info(f"Running agent with query: '{user_query}'")

    # Prepare to use ADK Runner
    session_service = InMemorySessionService()
    artifacts_service = InMemoryArtifactService()
    # Convert user input into a format ADK can understand
    message = Content(role="user", parts=[Part(text=user_query)])

    runner = Runner(
        app_name="standalone_test",
        agent=agent,
        session_service=session_service,
        artifact_service=artifacts_service,
    )
    session = session_service.create_session(state={}, app_name="standalone_test", user_id="test_user")
    logger.info(f"Running agent with session: '{session}'")

    final_response = None
    # run_async returns an asynchronous iterator of events
    async for event in runner.run_async(session_id=session.id, user_id=session.user_id, new_message=message):
        logger.info(f"Agent Event: {event}")

        if event.content and event.content.parts:
            final_response = event.content.parts[0].text

    logger.info(f"Agent final response: {final_response}")
    return final_response or ""
