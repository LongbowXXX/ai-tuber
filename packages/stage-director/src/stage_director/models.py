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
    caption: str
    emotion: str
    speakId: str


class SpeakEndPayload(BaseModel):
    speakId: str


class DisplayMarkdownTextPayload(BaseModel):
    text: str


class TriggerAnimationCommand(BaseModel):
    command: Literal["triggerAnimation"] = "triggerAnimation"
    payload: TriggerAnimationPayload


class SpeakCommand(BaseModel):
    command: Literal["speak"] = "speak"
    payload: SpeakPayload


class SpeakEndCommand(BaseModel):
    command: Literal["speakEnd"] = "speakEnd"
    payload: SpeakEndPayload


class DisplayMarkdownTextCommand(BaseModel):
    command: Literal["displayMarkdown"] = "displayMarkdown"
    payload: DisplayMarkdownTextPayload


# --- New Camera Control Models ---
class ControlCameraPayload(BaseModel):
    mode: str
    targetId: str = ""
    duration: float = 1.0


class ControlCameraCommand(BaseModel):
    command: Literal["controlCamera"] = "controlCamera"
    payload: ControlCameraPayload


StageCommand = Union[
    TriggerAnimationCommand,
    SpeakCommand,
    SpeakEndCommand,
    DisplayMarkdownTextCommand,
    ControlCameraCommand,
]


# --- Helper to create command JSON ---
def create_command_json(command_model: BaseModel) -> str:
    """Creates a JSON string from a Pydantic command model."""
    return command_model.model_dump_json()
