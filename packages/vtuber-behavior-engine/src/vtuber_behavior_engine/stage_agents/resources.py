#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from pathlib import Path


def initial_message() -> str:
    return Path(__file__, "../resources/initial_message.md").resolve().read_text(encoding="utf-8")


def initial_news_context() -> str:
    return Path(__file__, "../resources/news/initial_context.md").resolve().read_text(encoding="utf-8")


def update_news_context() -> str:
    return Path(__file__, "../resources/news/update_context.md").resolve().read_text(encoding="utf-8")


def initial_presentation_context() -> str:
    return Path(__file__, "../resources/presentation/initial_context.md").resolve().read_text(encoding="utf-8")


def update_presentation_context() -> str:
    return Path(__file__, "../resources/presentation/update_context.md").resolve().read_text(encoding="utf-8")


def how_to_use_ai_slides_json() -> str:
    return (
        Path(
            __file__,
            "../resources/presentation/slides/how_to_use_ai.json",
        )
        .resolve()
        .read_text(encoding="utf-8")
    )


def logical_thinking_slides_json() -> str:
    return (
        Path(
            __file__,
            "../resources/presentation/slides/logical_thinking.json",
        )
        .resolve()
        .read_text(encoding="utf-8")
    )


def load_character_xml(prompt_file: str) -> str:
    path = Path(__file__, f"../resources/{prompt_file}").resolve()
    if not path.exists():
        # absolute path or relative to cwd check
        path = Path(prompt_file).resolve()
    return path.read_text(encoding="utf-8")


def character1() -> str:
    return Path(__file__, "../resources/characters/character1.xml").resolve().read_text(encoding="utf-8")


def character2() -> str:
    return Path(__file__, "../resources/characters/character2.xml").resolve().read_text(encoding="utf-8")


def character_prompt(character_id: str, character_detail: str) -> str:
    return (
        Path(__file__, "../resources/character_prompt.md")
        .resolve()
        .read_text(encoding="utf-8")
        .replace("{character_id}", character_id)
        .replace("{character_detail}", character_detail)
    )


def character_output_prompt(character_id: str, available_character_ids: list[str]) -> str:
    # Format: "Character1" または "Character2"
    formatted_ids = " または ".join([f'"{cid}"' for cid in available_character_ids])
    return (
        Path(__file__, "../resources/character_output_prompt.md")
        .resolve()
        .read_text(encoding="utf-8")
        .replace("{character_id}", character_id)
        .replace("{available_characters}", formatted_ids)
    )


def recall_conversation_prompt() -> str:
    return Path(__file__, "../resources/recall_conversation_prompt.md").resolve().read_text(encoding="utf-8")
