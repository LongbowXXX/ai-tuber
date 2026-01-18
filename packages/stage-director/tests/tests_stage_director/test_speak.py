import pytest
from unittest.mock import AsyncMock, patch
from stage_director.stage_director_mcp_server import speak
from stage_director.models import SpeakCommand


@pytest.mark.asyncio
async def test_speak_command_with_style() -> None:
    """Test speak command with style option."""
    character_id = "test_char"
    message = "Hello"
    caption = "Hello caption"
    emotion = "happy"
    style = "happy_style"

    with patch("stage_director.stage_director_mcp_server.enqueue_command", new_callable=AsyncMock) as mock_enqueue:
        with patch("stage_director.stage_director_mcp_server.wait_for_command", new_callable=AsyncMock) as mock_wait:
            result = await speak(character_id, message, caption, emotion, style)

            assert result == "Success"

            # Verify enqueue_command was called
            assert mock_enqueue.called
            args, _ = mock_enqueue.call_args
            command = args[0]

            assert isinstance(command, SpeakCommand)
            assert command.payload.characterId == character_id
            assert command.payload.message == message
            assert command.payload.caption == caption
            assert command.payload.emotion == emotion
            assert command.payload.style == style
            assert command.payload.speakId is not None

            # Verify wait_for_command was called with the correct speakId
            mock_wait.assert_called_once_with(command.payload.speakId)


@pytest.mark.asyncio
async def test_speak_command_without_style() -> None:
    """Test speak command without style option (default behavior)."""
    character_id = "test_char"
    message = "Hello"
    caption = "Hello caption"
    emotion = "neutral"

    with patch("stage_director.stage_director_mcp_server.enqueue_command", new_callable=AsyncMock) as mock_enqueue:
        with patch("stage_director.stage_director_mcp_server.wait_for_command", new_callable=AsyncMock) as mock_wait:
            result = await speak(character_id, message, caption, emotion)

            assert result == "Success"

            # Verify enqueue_command was called
            assert mock_enqueue.called
            args, _ = mock_enqueue.call_args
            command = args[0]

            assert isinstance(command, SpeakCommand)
            assert command.payload.characterId == character_id
            assert command.payload.message == message
            assert command.payload.caption == caption
            assert command.payload.emotion == emotion
            assert command.payload.style is None
            assert command.payload.speakId is not None

            # Verify wait_for_command was called with the correct speakId
            mock_wait.assert_called_once_with(command.payload.speakId)
