#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio
import queue

import pytest
from unittest.mock import MagicMock, patch

from vtuber_behavior_engine.services.speech_recognition import SpeechRecognitionManager, SpeechRecognitionTool


class TestSpeechRecognitionManager:
    """SpeechRecognitionManager の基本機能をテスト"""

    @patch("vtuber_behavior_engine.services.speech_recognition.speech.SpeechClient")
    @patch("vtuber_behavior_engine.services.speech_recognition.pyaudio.PyAudio")
    def test_initialization(self, mock_pyaudio: MagicMock, mock_speech_client: MagicMock) -> None:
        """マネージャーが正常に初期化されることを確認"""
        manager = SpeechRecognitionManager()
        assert manager is not None
        assert isinstance(manager._transcript_queue, queue.Queue)
        mock_speech_client.assert_called_once()
        mock_pyaudio.assert_called_once()

    @patch("vtuber_behavior_engine.services.speech_recognition.speech.SpeechClient")
    @patch("vtuber_behavior_engine.services.speech_recognition.pyaudio.PyAudio")
    def test_get_transcripts_empty(self, mock_pyaudio: MagicMock, mock_speech_client: MagicMock) -> None:
        """キューが空の場合、空のリストを返すことを確認"""
        manager = SpeechRecognitionManager()
        transcripts = manager.get_transcripts(timeout=0.01)
        assert transcripts == []

    @patch("vtuber_behavior_engine.services.speech_recognition.speech.SpeechClient")
    @patch("vtuber_behavior_engine.services.speech_recognition.pyaudio.PyAudio")
    def test_get_transcripts_with_data(self, mock_pyaudio: MagicMock, mock_speech_client: MagicMock) -> None:
        """キューにデータがある場合、全て取得できることを確認"""
        manager = SpeechRecognitionManager()
        manager._transcript_queue.put("こんにちは")
        manager._transcript_queue.put("テストです")

        transcripts = manager.get_transcripts(timeout=0.01)
        assert transcripts == ["こんにちは", "テストです"]


class TestSpeechRecognitionTool:
    """SpeechRecognitionTool の基本機能をテスト"""

    @pytest.mark.asyncio
    async def test_initialization(self) -> None:
        """ツールが正常に初期化されることを確認"""
        tool = SpeechRecognitionTool()
        assert tool.name == "get_user_speech"
        assert tool._manager is None

    @pytest.mark.asyncio
    @patch("vtuber_behavior_engine.services.speech_recognition.speech.SpeechClient")
    @patch("vtuber_behavior_engine.services.speech_recognition.pyaudio.PyAudio")
    async def test_call_without_manager(self, mock_pyaudio: MagicMock, mock_speech_client: MagicMock) -> None:
        """マネージャーが未初期化の場合、空のリストを返すことを確認"""
        tool = SpeechRecognitionTool()
        result = await tool()
        assert result == {"transcripts": []}

    @pytest.mark.asyncio
    @patch("vtuber_behavior_engine.services.speech_recognition.speech.SpeechClient")
    @patch("vtuber_behavior_engine.services.speech_recognition.pyaudio.PyAudio")
    async def test_start_and_stop_recognition(self, mock_pyaudio: MagicMock, mock_speech_client: MagicMock) -> None:
        """音声認識の開始と停止が正常に動作することを確認"""
        tool = SpeechRecognitionTool()

        # 開始
        tool.start_recognition()
        assert tool._manager is not None

        # 少し待機
        await asyncio.sleep(0.1)

        # 停止
        tool.stop_recognition()
        assert tool._manager is None

    @pytest.mark.asyncio
    @patch("vtuber_behavior_engine.services.speech_recognition.speech.SpeechClient")
    @patch("vtuber_behavior_engine.services.speech_recognition.pyaudio.PyAudio")
    async def test_call_with_transcripts(self, mock_pyaudio: MagicMock, mock_speech_client: MagicMock) -> None:
        """キューにデータがある場合、ツール呼び出しで取得できることを確認"""
        tool = SpeechRecognitionTool()
        tool.start_recognition()

        # キューに直接データを追加
        tool._manager._transcript_queue.put("テスト発話")

        result = await tool()
        assert result == {"transcripts": ["テスト発話"]}

        tool.stop_recognition()
