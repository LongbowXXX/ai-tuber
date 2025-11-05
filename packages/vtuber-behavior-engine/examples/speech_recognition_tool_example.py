#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

"""
SpeechRecognitionTool の使用例

このスクリプトは、SpeechRecognitionTool をエージェントに組み込む方法を示します。
環境変数 GOOGLE_APPLICATION_CREDENTIALS を設定してから実行してください。
"""

import asyncio
import logging

from vtuber_behavior_engine.services import SpeechRecognitionTool
from vtuber_behavior_engine.utils.logger import setup_logger

setup_logger()
logger = logging.getLogger(__name__)


async def main() -> None:
    # 1. SpeechRecognitionTool を作成
    speech_tool = SpeechRecognitionTool()

    # 2. 音声認識を開始（バックグラウンドで実行される）
    speech_tool.start_recognition()
    logger.info("音声認識を開始しました。話しかけてください...")

    try:
        # 3. エージェントを作成してツールを登録する方法については
        # agent_runner.py の run_agent_standalone() を参照してください
        # 例: agent = LlmAgent(
        #   model="gemini-2.0-flash-exp",
        #   instruction="...",
        #   tools=[speech_tool],
        # )
        logger.info("エージェントの実行例は agent_runner.py を参照してください")

    finally:
        # 5. 音声認識を停止
        speech_tool.stop_recognition()
        logger.info("音声認識を停止しました。")


if __name__ == "__main__":
    asyncio.run(main())
