#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

from typing import Literal, Union

from pydantic import BaseModel


class TriggerAnimationPayload(BaseModel):
    characterId: str
    animationName: str


class SpeakPayload(BaseModel):
    characterId: str
    message: str
    emotion: str
    speakId: str  # Added speakId to the payload


class TriggerAnimationCommand(BaseModel):
    command: Literal["triggerAnimation"] = "triggerAnimation"
    payload: TriggerAnimationPayload


class SpeakCommand(BaseModel):
    command: Literal["speak"] = "speak"
    payload: SpeakPayload


StageCommand = Union[
    TriggerAnimationCommand,
    SpeakCommand,
]


# --- Helper to create command JSON ---
def create_command_json(command_model: BaseModel) -> str:
    """Creates a JSON string from a Pydantic command model."""
    return command_model.model_dump_json()
