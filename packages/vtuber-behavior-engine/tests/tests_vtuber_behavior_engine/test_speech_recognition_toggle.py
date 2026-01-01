#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import pytest
from unittest.mock import patch, AsyncMock

from vtuber_behavior_engine.services.speech_recognition import (
    DummySpeechRecognitionTool,
)
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.news.news_root_agent_builder import build_root_news_agent


@pytest.mark.asyncio
async def test_dummy_speech_recognition_tool_behavior() -> None:
    """SRT-003: ダミーツールからの発話取得"""
    tool = DummySpeechRecognitionTool()

    # start/stop がエラーにならないこと (SRT-E01)
    tool.start_recognition()
    tool.stop_recognition()

    # 呼び出し結果が空であること
    result = await tool()
    assert result == {"transcripts": []}


@pytest.mark.asyncio
async def test_build_root_news_agent_with_speech_disabled() -> None:
    """SRT-002: 音声認識を明示的に無効化して起動"""
    config = AgentsConfig(use_speech_recognition=False)

    # StageDirectorMCPClient.create_async をモック
    with patch(
        "vtuber_behavior_engine.stage_agents.news.news_root_agent_builder.StageDirectorMCPClient.create_async"
    ) as mock_create:
        mock_client = AsyncMock()
        mock_client.load_tools.return_value = []
        mock_create.return_value = mock_client

        # SpeechRecognitionTool がインスタンス化されないことを確認するためにパッチ
        with patch(
            "vtuber_behavior_engine.stage_agents.news.news_root_agent_builder.SpeechRecognitionTool"
        ) as mock_real_tool:
            result = await build_root_news_agent(config)
            assert result is not None
            agent, exit_stack = result

            assert agent is not None
            assert exit_stack is not None

            # Real tool は呼ばれていないはず
            mock_real_tool.assert_not_called()

            await exit_stack.aclose()


@pytest.mark.asyncio
async def test_build_root_news_agent_with_speech_enabled_default() -> None:
    """SRT-001: デフォルト設定での起動（音声認識有効）"""
    config = AgentsConfig()  # default use_speech_recognition=True

    with patch(
        "vtuber_behavior_engine.stage_agents.news.news_root_agent_builder.StageDirectorMCPClient.create_async"
    ) as mock_create:
        mock_client = AsyncMock()
        mock_client.load_tools.return_value = []
        mock_create.return_value = mock_client

        # SpeechRecognitionTool の初期化でマイクが動かないようにモック
        with patch("vtuber_behavior_engine.services.speech_recognition.SpeechRecognitionManager") as mock_manager:
            result = await build_root_news_agent(config)
            assert result is not None
            agent, exit_stack = result

            assert agent is not None
            # Manager が作成されているはず
            mock_manager.assert_called_once()

            await exit_stack.aclose()


def test_agents_config_validation() -> None:
    """SRT-S01: 設定値の型安全性"""
    # 正しい型
    config = AgentsConfig(use_speech_recognition=False)
    assert config.use_speech_recognition is False

    # 不正な型 (Pydantic が変換を試みるが、明らかに無理な場合はエラーになるはず)
    # bool フィールドに文字列を入れると Pydantic V2 では "true"/"false" などは変換されるが、
    # 全く関係ない文字列などはエラーになる可能性がある。
    with pytest.raises(Exception):
        # Pydantic のバリデーションエラーを期待
        AgentsConfig(use_speech_recognition={"invalid": "type"})  # type: ignore[arg-type, unused-ignore]
