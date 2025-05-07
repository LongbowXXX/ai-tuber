#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

from typing import Literal, Union, Any

from pydantic import BaseModel


# --- Pydantic Models for Commands ---


class LogMessagePayload(BaseModel):
    message: str


class SetPosePayload(BaseModel):
    characterId: str
    poseName: str


class TriggerAnimationPayload(BaseModel):
    characterId: str
    animationName: str


class SpeakPayload(BaseModel):
    characterId: str
    message: str
    emotion: str


class AcknowledgementPayload(BaseModel):
    status: str
    original_message: str | dict[str, Any] | None = None


class LogMessageCommand(BaseModel):
    command: Literal["logMessage"] = "logMessage"
    payload: LogMessagePayload


class SetPoseCommand(BaseModel):
    command: Literal["setPose"] = "setPose"
    payload: SetPosePayload


class TriggerAnimationCommand(BaseModel):
    command: Literal["triggerAnimation"] = "triggerAnimation"
    payload: TriggerAnimationPayload


class SpeakCommand(BaseModel):
    command: Literal["speak"] = "speak"
    payload: SpeakPayload


class AcknowledgementCommand(BaseModel):
    command: Literal["acknowledgement"] = "acknowledgement"
    payload: AcknowledgementPayload


StageCommand = Union[
    LogMessageCommand,
    SetPoseCommand,
    TriggerAnimationCommand,
    SpeakCommand,
    AcknowledgementCommand,
]


# --- Helper to create command JSON ---
def create_command_json(command_model: BaseModel) -> str:
    """Creates a JSON string from a Pydantic command model."""
    return command_model.model_dump_json()
