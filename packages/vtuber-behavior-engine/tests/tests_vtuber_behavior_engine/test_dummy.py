#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import json

from vtuber_behavior_engine.stage_agents.presentation.presentation_models import PresentationAll


def test_dummy() -> None:
    """A dummy test to ensure the test suite is running."""
    assert True

def test_dump_presentation() -> None:
    json_str = json.dumps(PresentationAll.model_json_schema(), indent=2)
    print(json_str)
