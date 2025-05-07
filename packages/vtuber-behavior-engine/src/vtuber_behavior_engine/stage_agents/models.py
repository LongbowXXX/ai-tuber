#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from typing import Literal

from pydantic import BaseModel


class AgentSpeech(BaseModel):
    """エージェントのセリフを表すクラス"""

    character_id: str
    """キャラクターのID"""

    text: str
    """セリフのテキスト"""

    emotion: Literal["neutral", "happy", "sad", "angry", "relaxed", "surprised"]
    """セリフの感情"""

    def __str__(self) -> str:
        return f"Character ID: {self.character_id}, Text: {self.text}, Emotion: {self.emotion}"
