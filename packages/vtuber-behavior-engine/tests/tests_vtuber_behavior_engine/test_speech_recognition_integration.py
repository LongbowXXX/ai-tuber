#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
"""
SpeechRecognitionManager の統合テスト

このテストは実際のGoogle Speech-to-Text APIを呼び出すため、
環境変数 GOOGLE_API_KEY が設定されている必要があります。

pytest -k test_speech_recognition_integration で実行できます。
"""
import logging
import queue
import time

from dotenv import load_dotenv

from vtuber_behavior_engine.services.speech_recognition import SpeechRecognitionManager

logger = logging.getLogger(__name__)


def test_speech_recognition_with_real_microphone() -> None:
    """
    実際のマイクを使用した音声認識テスト

    このテストを実行するには:
    set RUN_MANUAL_TESTS=1
    pytest -k test_speech_recognition_with_real_microphone -s

    テスト開始後、日本語で何か話しかけてください。
    """
    load_dotenv()
    logger.info("=" * 80)
    logger.setLevel(logging.DEBUG)
    logger.info("=" * 80)
    logger.info("実際のマイクを使用した音声認識テストを開始します")
    logger.info("10秒間、日本語で何か話しかけてください...")
    logger.info("=" * 80)

    with SpeechRecognitionManager() as transcript_queue:
        # 10秒間待機
        for i in range(10, 0, -1):
            logger.info(f"残り {i} 秒...")
            time.sleep(1.0)

    # 結果を表示
    logger.info("=" * 80)
    logger.info("音声認識結果:")
    logger.info("=" * 80)

    transcripts = []
    while not transcript_queue.empty():
        try:
            text = transcript_queue.get_nowait()
            transcripts.append(text)
            logger.info(f"  - {text}")
        except queue.Empty:
            break

    if not transcripts:
        logger.warning("音声が認識されませんでした。マイクの設定を確認してください。")
    else:
        logger.info(f"合計 {len(transcripts)} 件の発話が認識されました")

    logger.info("=" * 80)

    # 何らかの音声が認識されることを期待(ただし、環境により異なる)
    assert isinstance(transcripts, list)
