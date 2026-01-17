from unittest.mock import MagicMock, AsyncMock
import inspect

import pytest
from google.adk.tools.base_tool import BaseTool
from vtuber_behavior_engine.services.stage_director_mcp_client import (
    StageDirectorMCPClient,
)
from vtuber_behavior_engine.stage_agents.agent_builder import build_root_agent
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig


@pytest.mark.asyncio
async def test_agent_builder_includes_camera_tool() -> None:
    # Mock dependencies using real LlmAgent to satisfy Pydantic validation
    from google.adk.agents import LlmAgent

    # helper to create dummy agent
    def create_dummy_agent(name: str) -> LlmAgent:
        return LlmAgent(model="dummy", name=name, instruction="dummy")

    initial_context_agent = create_dummy_agent("initial_context")
    update_context_agent = create_dummy_agent("update_context")
    stage_director_client = MagicMock(spec=StageDirectorMCPClient)
    # Mock load_tools to return camera control tools
    mock_camera_tool = MagicMock(spec=BaseTool)
    mock_camera_tool.name = "control_camera"
    mock_trigger_tool = MagicMock(spec=BaseTool)
    mock_trigger_tool.name = "trigger_animation"
    mock_other_tool = MagicMock(spec=BaseTool)
    mock_other_tool.name = "other_tool"

    stage_director_client.load_tools = AsyncMock(return_value=[mock_camera_tool, mock_trigger_tool, mock_other_tool])

    agent_config = AgentsConfig(max_iterations=1)
    exit_stack = AsyncMock()

    # Build the root agent
    root_agent = build_root_agent(
        initial_context_agent,
        update_context_agent,
        stage_director_client,
        agent_config,
        exit_stack,
    )

    # Simulate initialization callback
    # The initialization logic is inside the before_agent_callback of the root agent
    # We need to access the callback and execute it.

    # Check if before_agent_callback exists
    assert root_agent.before_agent_callback is not None

    # Mock callback context
    callback_context = MagicMock()
    callback_context.state = {}

    # Run the initialization
    if root_agent.before_agent_callback:
        callbacks = (
            root_agent.before_agent_callback
            if isinstance(root_agent.before_agent_callback, list)
            else [root_agent.before_agent_callback]
        )
        for callback in callbacks:
            res = callback(callback_context)
            if inspect.isawaitable(res):
                await res

    # access the sub-agents to verify tool injection
    # Implementation detail: root agent is SequentialAgent, sub_agents[1] is LoopAgent
    loop_agent = root_agent.sub_agents[1]
    # In LoopAgent, sub_agents are:
    # 0: recall, 1: agent1_thought, 2: agent1_output, 3: agent2_thought, 4: agent2_output, 5: update_context
    agent1_output = loop_agent.sub_agents[2]
    agent2_output = loop_agent.sub_agents[4]

    from typing import Any

    # function to check if tool is present
    def has_tool(agent: Any, tool_name: str) -> bool:
        return any(t.name == tool_name for t in agent.tools)

    # Verify agent1 has camera tool
    assert has_tool(agent1_output, "control_camera"), "Agent 1 should have control_camera tool"
    assert has_tool(agent1_output, "trigger_animation"), "Agent 1 should have trigger_animation tool"
    assert not has_tool(agent1_output, "other_tool"), "Agent 1 should NOT have other_tool"

    # Verify agent2 has camera tool
    assert has_tool(agent2_output, "control_camera"), "Agent 2 should have control_camera tool"
    assert has_tool(agent2_output, "trigger_animation"), "Agent 2 should have trigger_animation tool"
