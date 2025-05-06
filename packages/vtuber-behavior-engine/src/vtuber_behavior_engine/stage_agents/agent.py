#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging

from google.adk.agents import LlmAgent, LoopAgent, SequentialAgent

from vtuber_behavior_engine.mcp_client import get_tools_async
from vtuber_behavior_engine.stage_agents.agent_constants import (
    GEMINI_MODEL,
)

APP_NAME = "doc_writing_app_v3"  # New App Name
USER_ID = "dev_user_01"
SESSION_ID_BASE = "loop_exit_tool_session"  # New Base Session ID

# --- State Keys ---
STATE_CURRENT_DOC = "current_document"
STATE_CRITICISM = "criticism"
STATE_CURRENT_TOPIC = "current_topic"

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

tools, exit_stack = asyncio.create_task(get_tools_async())

logger.info("Creating Character Agent 1...")
# Create LlmAgent
agent1 = LlmAgent(
    model="gemini-2.0-flash",
    name="avatar1",  # Agent name
    # Agent instructions (persona and task)
    instruction="""You are Character avatar1, a bright and cheerful virtual talent.
Please respond naturally and concisely to user input and topic.

Current topic:

```
{{current_topic}}

```

Your responses will be used directly in conversation.
Depending on what you want to say, choose the appropriate facial expression and must call set_expression tool.
To speak to the user, call the speak tool.

Please reply in Japanese.
""",
    tools=tools,
)
logger.info("Character Agent 1 created.")

logger.info("Creating Character Agent 2...")
# Create LlmAgent
agent2 = LlmAgent(
    model="gemini-2.0-flash",
    name="avatar2",  # Agent name
    # Agent instructions (persona and task)
    instruction="""You are Character avatar2, a bright and cheerful virtual talent.
Please respond naturally and concisely to user input and topic.

Current topic:

```
{{current_topic}}

```

Your responses will be used directly in conversation.
Depending on what you want to say, choose the appropriate facial expression and must call set_expression tool.
To speak to the user, call the speak tool.

Please reply in Japanese.
""",
    tools=tools,
)
logger.info("Character Agent 2 created.")

initial_topic_agent_in_loop = LlmAgent(
    name="TopicAgent",
    model=GEMINI_MODEL,
    # Relies solely on state via placeholders
    include_contents="none",
    instruction=f"""As a topic provider, you create new topic.

Task:

In your reply, include only the topic content, do not add any explanation.

Please reply in Japanese.
""",
    description="Topic provider.",
    output_key=STATE_CURRENT_TOPIC,
)


topic_agent_in_loop = LlmAgent(
    name="TopicAgent",
    model=GEMINI_MODEL,
    # Relies solely on state via placeholders
    include_contents="none",
    instruction=f"""As a topic provider, you update the current topic based on the agent's conversation history.

Current topic:

```
{{current_topic}}

```

Task:

Analyze the conversation history.

If the conversation is stuck and a new topic is needed, suggest a new topic.

If the current topic is fine, reply with the current topic as is.

In your reply, include only the topic content, do not add any explanation.

Please reply in Japanese.
""",
    description="Topic provider.",
    output_key=STATE_CURRENT_TOPIC,
)


# STEP 2: Refinement Loop Agent
refinement_loop = LoopAgent(
    name="RefinementLoop",
    # Agent order is crucial: Critique first, then Refine/Exit
    sub_agents=[
        agent1,
        agent2,
        topic_agent_in_loop,
    ],
    max_iterations=3,  # Limit loops
)

# STEP 3: Overall Sequential Pipeline
# For ADK tools compatibility, the root agent must be named `root_agent`
root_agent = SequentialAgent(
    name="IterativeAgentsPipeline",
    sub_agents=[
        initial_topic_agent_in_loop,
        refinement_loop,
    ],
    description="Writes an initial document and then iteratively refines it with critique using an exit tool.",
)

# # Prepare to use ADK Runner
# session_service = InMemorySessionService()
# artifacts_service = InMemoryArtifactService()
# # Convert user input into a format ADK can understand
# message = Content(role="user", parts=[Part(text=user_query)])
#
# runner = Runner(
#     app_name=APP_NAME,
#     agent=root_agent,
#     session_service=session_service,
#     artifact_service=artifacts_service,
# )
# session = session_service.create_session(state={}, app_name=APP_NAME, user_id=USER_ID)
# logger.info(f"Running agent with session: '{session}'")
#
# final_response = None
# # run_async returns an asynchronous iterator of events
# async for event in runner.run_async(session_id=session.id, user_id=session.user_id, new_message=message):
#     logger.info(f"Root Agent Event: {event}")
#
#     if event.content and event.content.parts:
#         final_response = event.content.parts[0].text
#
# logger.info(f"Root Agent final response: {final_response}")
