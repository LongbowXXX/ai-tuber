#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from pathlib import Path


def initial_message() -> str:
    return Path(__file__, "../resources/initial_message.md").resolve().read_text(encoding="utf-8")


def latest_news_prompt() -> str:
    return Path(__file__, "../resources/latest_news_prompt.md").resolve().read_text(encoding="utf-8")


def initial_context() -> str:
    return Path(__file__, "../resources/initial_context.md").resolve().read_text(encoding="utf-8")


def update_context() -> str:
    return Path(__file__, "../resources/update_context.md").resolve().read_text(encoding="utf-8")


def character1() -> str:
    return Path(__file__, "../resources/character1.md").resolve().read_text(encoding="utf-8")


def character2() -> str:
    return Path(__file__, "../resources/character2.md").resolve().read_text(encoding="utf-8")


def character_prompt(character_id: str, character_detail: str) -> str:
    return (
        Path(__file__, "../resources/character_prompt.md")
        .resolve()
        .read_text(encoding="utf-8")
        .replace("{character_id}", character_id)
        .replace("{character_detail}", character_detail)
    )


def character_output_prompt() -> str:
    return Path(__file__, "../resources/character_output_prompt.md").resolve().read_text(encoding="utf-8")
