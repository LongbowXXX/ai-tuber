#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging

from google.adk.agents import LlmAgent, LoopAgent, SequentialAgent, BaseAgent
from google.adk.tools.mcp_tool import MCPTool

from vtuber_behavior_engine.stage_agents.agent_constants import (
    GEMINI_MODEL,
)

# --- State Keys ---
STATE_CURRENT_TOPIC = "current_topic"

logger = logging.getLogger(__name__)


def create_root_agent(character_tools: list[MCPTool]) -> BaseAgent:
    """Create the root agent for the iterative refinement process."""
    # Create the tools and exit stack
    logger.info("Creating tools...")

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
        tools=character_tools,
        description="Character avatar1 agent",
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
        tools=character_tools,
        description="Character avatar2 agent",
    )
    logger.info("Character Agent 2 created.")

    initial_topic_agent_in_loop = LlmAgent(
        name="InitialTopicProvider",
        model=GEMINI_MODEL,
        # Relies solely on state via placeholders
        include_contents="none",
        instruction=f"""As a topic provider, you create new topic.
    
    Task:
    
    In your reply, include only the topic content, do not add any explanation.
    
    Please reply in Japanese.
    """,
        description="Provides the initial topic for the conversation.",
        output_key=STATE_CURRENT_TOPIC,
    )

    topic_agent_in_loop = LlmAgent(
        name="TopicUpdater",
        model=GEMINI_MODEL,
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
        description="Updates the current topic based on conversation history.",
        output_key=STATE_CURRENT_TOPIC,
    )

    agent_conversation_loop = LoopAgent(
        name="ConversationLoop",
        sub_agents=[
            agent1,
            agent2,
            topic_agent_in_loop,
        ],
        max_iterations=3,
    )

    root_agent = SequentialAgent(
        name="ConversationPipeline",
        sub_agents=[
            initial_topic_agent_in_loop,
            agent_conversation_loop,
        ],
        description="Manages the conversation flow with multiple agents.",
    )
    return root_agent
