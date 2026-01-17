import pytest
from unittest.mock import patch, AsyncMock
from stage_director.stage_director_mcp_server import control_camera
from stage_director.models import ControlCameraCommand, ControlCameraPayload


@pytest.mark.asyncio
async def test_control_camera_success() -> None:
    # Mock enqueue_command to verify it gets called
    with patch("stage_director.stage_director_mcp_server.enqueue_command", new_callable=AsyncMock) as mock_enqueue:
        result = await control_camera(mode="closeUp", target_id="target1", duration=2.5)

        assert result == "Success"

        # Verify enqueue_command was called once
        mock_enqueue.assert_called_once()

        # Verify the argument passed to enqueue_command
        args, _ = mock_enqueue.call_args
        command = args[0]

        assert isinstance(command, ControlCameraCommand)
        assert command.command == "controlCamera"
        assert isinstance(command.payload, ControlCameraPayload)
        assert command.payload.mode == "closeUp"
        assert command.payload.targetId == "target1"
        assert command.payload.duration == 2.5


@pytest.mark.asyncio
async def test_control_camera_default_values() -> None:
    with patch("stage_director.stage_director_mcp_server.enqueue_command", new_callable=AsyncMock) as mock_enqueue:
        result = await control_camera(mode="default")

        assert result == "Success"
        mock_enqueue.assert_called_once()

        args, _ = mock_enqueue.call_args
        command = args[0]

        assert command.payload.mode == "default"
        # Verify defaults
        assert command.payload.targetId == ""
        assert command.payload.duration == 1.0


@pytest.mark.asyncio
async def test_control_camera_failure() -> None:
    # Simulate an error during enqueue
    with patch("stage_director.stage_director_mcp_server.enqueue_command", side_effect=Exception("Queue full")):
        result = await control_camera(mode="failure_test")

        assert result.startswith("Failed to control camera")
        assert "Queue full" in result
