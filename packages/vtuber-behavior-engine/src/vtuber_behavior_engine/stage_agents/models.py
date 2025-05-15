#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from typing import Literal

from pydantic import BaseModel, Field


class AgentSpeechItem(BaseModel):
    """エージェントの単一のセリフを表すクラス"""

    tts_text: str = Field(
        description="セリフのテキスト。日本語に対応したTTSで読み上げるので、日本語以外の単語はカタカナで書いてください。"
    )
    caption: str | None = Field(
        description="セリフのキャプション。エージェント発話の吹き出し表示に利用します。tts_textと同じ内容の場合は設定不要です。",
        default=None,
    )
    emotion: Literal["neutral", "happy", "sad", "angry", "relaxed", "surprised"] = Field(description="セリフの感情")

    def __str__(self) -> str:
        return f"Text: {self.tts_text}, Caption: {self.caption}, Emotion: {self.emotion}"


class AgentSpeech(BaseModel):
    """エージェントの複数のセリフを表すクラス"""

    character_id: str = Field(description="キャラクターのID")

    speeches: list[AgentSpeechItem] = Field(description="セリフのリスト")

    def __str__(self) -> str:
        return f"Character ID: {self.character_id}, Speeches: {[str(speech) for speech in self.speeches]}"
