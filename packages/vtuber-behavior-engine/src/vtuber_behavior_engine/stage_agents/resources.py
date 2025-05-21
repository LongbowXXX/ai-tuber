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


def character1() -> str:
    return Path(__file__, "../resources/characters/character1.md").resolve().read_text(encoding="utf-8")


def character2() -> str:
    return Path(__file__, "../resources/characters/character2.md").resolve().read_text(encoding="utf-8")


def character_prompt(character_id: str, character_detail: str) -> str:
    return (
        Path(__file__, "../resources/character_prompt.md")
        .resolve()
        .read_text(encoding="utf-8")
        .replace("{character_id}", character_id)
        .replace("{character_detail}", character_detail)
    )


def character_output_prompt(character_id: str) -> str:
    return (
        Path(__file__, "../resources/character_output_prompt.md")
        .resolve()
        .read_text(encoding="utf-8")
        .replace("{character_id}", character_id)
    )


def recall_conversation_prompt() -> str:
    return Path(__file__, "../resources/recall_conversation_prompt.md").resolve().read_text(encoding="utf-8")
