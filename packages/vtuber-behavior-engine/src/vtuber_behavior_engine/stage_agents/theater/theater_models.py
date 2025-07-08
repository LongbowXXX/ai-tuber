#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php


from typing import List

from pydantic import BaseModel, Field


class CharacterInScene(BaseModel):
    character_name: str = Field(description="Name of the character in the scene.")
    position: str = Field(description="Fixed position of the character in this scene.")


class DialogueAndAction(BaseModel):
    character_name: str = Field(description="Name of the character speaking or acting.")
    message: str = Field(description="The character's dialogue. Can be an empty string if no dialogue.")
    motion: str = Field(
        description="Specific motion instruction for the AI talent, performed concurrently with or around the dialogue."
        " Example: 'nods slowly', 'eyes widen in surprise', 'clenches fist', 'sips from a cup'."
    )
    emotion: str = Field(
        description="The emotion the character should express at this moment."
        "Example: 'joy', 'deep sorrow', 'anger', 'confusion', 'relief', 'anticipation', 'fear', 'doubt'."
    )


class Character(BaseModel):
    name: str = Field(description="Name of the character.")
    description: str = Field(
        description="Detailed description of the character (appearance, personality, role in the story, "
        "background, struggles, or desires)."
    )
    initial_position_note: str = Field(
        description="Idea for the character's approximate initial position or state on stage. "
        "Example: 'stage left looking out the window', 'at the center table'."
    )


class Scene(BaseModel):
    scene_number: int = Field(description="Scene number (integer).")
    scene_setting: str = Field(description="Specific location, time of day, and atmosphere of this scene.")
    characters_in_scene: List[CharacterInScene] = Field(
        description="List of characters appearing in this scene and their fixed positions. "
        "Positions should be specific and relative, "
        "e.g., 'stage right front', 'center slightly stage left', 'upstage center'. "
        "Do not include characters not in the scene."
    )
    dialogues_and_actions: List[DialogueAndAction] = Field(
        description="List of dialogues, motions, and emotions in this scene."
    )
    background_description: str = Field(
        description="Description of the background to be dynamically generated for this scene."
    )


class TheaterPlay(BaseModel):
    title: str = Field(description="Generated title of the play.")
    theme_from_user: str = Field(description="The theme provided by the user, to be written here as is.")
    worldview: str = Field(
        description="Detailed description of the story's setting, including time period, location, atmosphere, "
        "and any unique rules."
    )
    characters: List[Character] = Field(
        description="List of characters in the play. Add a third character here if there are three; "
        "this is not limited to one or two."
    )
    scenes: List[Scene] = Field(
        description="List of scenes in the play. Adjust the number and length of scenes to "
        "achieve an approximate 30-minute performance."
    )
    estimated_total_duration_minutes: int = Field(description="Target total performance time in minutes (integer).")
