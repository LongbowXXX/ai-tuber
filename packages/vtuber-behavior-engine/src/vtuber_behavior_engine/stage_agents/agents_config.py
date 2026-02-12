#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from typing import List
from pydantic import BaseModel, Field


class CharacterConfig(BaseModel):
    id: str
    name: str
    prompt_file: str


class AgentsConfig(BaseModel):
    max_iterations: int = Field(default=5)
    use_speech_recognition: bool = Field(default=True)
    characters: List[CharacterConfig] = Field(default_factory=list)
