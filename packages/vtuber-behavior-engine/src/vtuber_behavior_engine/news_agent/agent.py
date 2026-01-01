#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
from vtuber_behavior_engine.stage_agents.news.news_root_agent_builder import build_root_news_agent

root_agent = build_root_news_agent(
    AgentsConfig(
        max_iterations=20,
        use_speech_recognition=False,
    )
)
