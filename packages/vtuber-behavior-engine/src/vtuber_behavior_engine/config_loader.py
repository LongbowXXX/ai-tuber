import yaml
from pathlib import Path
from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig


def load_config(config_name: str = "news_config.yaml") -> AgentsConfig:
    config_path = Path(__file__).parent.joinpath("stage_agents/resources").joinpath(config_name).resolve()
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with config_path.open("r", encoding="utf-8") as f:
        config_data = yaml.safe_load(f)

    return AgentsConfig(**config_data)
