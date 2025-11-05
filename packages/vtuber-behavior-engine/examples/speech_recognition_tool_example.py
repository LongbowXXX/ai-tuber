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

from google.adk.agents import LlmAgent

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
        # 3. エージェントを作成してツールを登録
        agent = LlmAgent(
            model="gemini-2.0-flash-exp",
            system_instruction=(
                "あなたは音声認識アシスタントです。"
                "定期的に get_user_speech ツールを使ってユーザーの発話を確認してください。"
                "発話があれば、その内容を要約して返してください。"
                "発話がなければ、「発話待ちです」と返してください。"
            ),
            tools=[speech_tool],
        )

        # 4. エージェントとの対話ループ
        for i in range(10):
            logger.info(f"\n--- ループ {i + 1} ---")
            response = await agent.run(
                user_message=f"発話をチェックしてください（{i + 1}回目）",
            )
            logger.info(f"エージェント応答: {response.message}")
            await asyncio.sleep(3)

    finally:
        # 5. 音声認識を停止
        speech_tool.stop_recognition()
        logger.info("音声認識を停止しました。")


if __name__ == "__main__":
    asyncio.run(main())
