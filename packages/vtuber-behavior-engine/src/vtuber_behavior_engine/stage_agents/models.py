#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from typing import Literal

from pydantic import BaseModel


class AgentSpeechItem(BaseModel):
    """エージェントの単一のセリフを表すクラス"""

    text: str
    """セリフのテキスト"""

    emotion: Literal["neutral", "happy", "sad", "angry", "relaxed", "surprised"]
    """セリフの感情"""

    def __str__(self) -> str:
        return f"Text: {self.text}, Emotion: {self.emotion}"


class AgentSpeech(BaseModel):
    """エージェントの複数のセリフを表すクラス"""

    character_id: str
    """キャラクターのID"""

    speeches: list[AgentSpeechItem]
    """セリフのリスト"""

    def __str__(self) -> str:
        return f"Character ID: {self.character_id}, Speeches: {[str(speech) for speech in self.speeches]}"
