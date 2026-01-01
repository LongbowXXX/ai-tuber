#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from pydantic import BaseModel, Field


class AgentsConfig(BaseModel):
    max_iterations: int = Field(default=5)
    use_speech_recognition: bool = Field(default=True)
