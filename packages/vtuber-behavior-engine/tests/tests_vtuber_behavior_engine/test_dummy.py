#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import json

from vtuber_behavior_engine.stage_agents.presentation.presentation_models import PresentationAll
from vtuber_behavior_engine.stage_agents.theater.theater_models import TheaterPlay


def test_dummy() -> None:
    """A fake test to ensure the test suite is running."""
    assert True


def test_dump_presentation() -> None:
    json_str = json.dumps(PresentationAll.model_json_schema(), indent=2)
    print(json_str)


def test_dump_theater() -> None:
    json_str = json.dumps(TheaterPlay.model_json_schema(), indent=2)
    print(json_str)
