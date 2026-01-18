import pytest
from unittest.mock import MagicMock, AsyncMock
from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.models import AgentSpeech, AgentSpeechItem
from google.adk.tools.mcp_tool.mcp_session_manager import MCPSessionManager
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset


@pytest.mark.asyncio
async def test_speak_with_style() -> None:
    # Mock dependencies
    mock_toolset = MagicMock(spec=McpToolset)
    mock_session_manager = MagicMock(spec=MCPSessionManager)
    mock_session = AsyncMock()
    mock_session_manager.create_session.return_value = mock_session

    client = StageDirectorMCPClient(toolset=mock_toolset, mcp_session_manager=mock_session_manager)

    # Create test data
    speech_item = AgentSpeechItem(tts_text="Hello", caption="Hello Caption", emotion="happy", style="あまあま")
    speech = AgentSpeech(character_id="char_123", speeches=[speech_item])

    # Call the method
    await client.speak_all(speech)

    # Verify that call_tool was called with the correct arguments including style
    mock_session.call_tool.assert_called_once_with(
        "speak",
        arguments={
            "message": "Hello",
            "caption": "Hello Caption",
            "character_id": "char_123",
            "emotion": "happy",
            "style": "あまあま",
        },
    )


@pytest.mark.asyncio
async def test_speak_without_style() -> None:
    # Mock dependencies
    mock_toolset = MagicMock(spec=McpToolset)
    mock_session_manager = MagicMock(spec=MCPSessionManager)
    mock_session = AsyncMock()
    mock_session_manager.create_session.return_value = mock_session

    client = StageDirectorMCPClient(toolset=mock_toolset, mcp_session_manager=mock_session_manager)

    # Create test data without style
    speech_item = AgentSpeechItem(tts_text="Hello", caption="Hello Caption", emotion="neutral")
    speech = AgentSpeech(character_id="char_123", speeches=[speech_item])

    # Call the method
    await client.speak_all(speech)

    # Verify that call_tool was called with correct arguments and style as None
    mock_session.call_tool.assert_called_once_with(
        "speak",
        arguments={
            "message": "Hello",
            "caption": "Hello Caption",
            "character_id": "char_123",
            "emotion": "neutral",
            "style": "ノーマル",
        },
    )
