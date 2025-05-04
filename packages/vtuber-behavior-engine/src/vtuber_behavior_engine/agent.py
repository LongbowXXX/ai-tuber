#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import asyncio
import logging

from dotenv import load_dotenv
from google.adk.agents.llm_agent import LlmAgent
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Character Agent Definition ---
def create_character_agent() -> LlmAgent:  # type: ignore[no-any-unimported]
    """Creates a simple character agent instance."""
    load_dotenv()  # .env ファイルから環境変数を読み込む
    logger.info("Creating Character Agent A...")
    # LlmAgent を作成
    agent = LlmAgent(
        model="gemini-2.0-flash",
        name="character_agent_a",  # エージェントの名前
        # エージェントの指示 (ペルソナとタスク)
        instruction="""あなたはキャラクターA、明るく元気なバーチャルタレントです。
ユーザーからの入力に対して、自然で簡潔に応答してください。
あなたの応答は、そのまま会話として利用されます。""",
        # tools=[] # この段階ではツールはまだ不要
    )
    logger.info("Character Agent A created.")
    return agent


# --- Agent Execution Logic (for standalone testing) ---
async def run_agent_standalone(agent: LlmAgent, user_query: str) -> str:  # type: ignore[no-any-unimported]
    """Runs the agent with a single query for testing."""
    logger.info(f"Running agent with query: '{user_query}'")

    # ADK Runner を使うための準備
    session_service = InMemorySessionService()
    artifacts_service = InMemoryArtifactService()
    # ユーザーからの入力をADKが理解できる形式に変換
    message = Content(role="user", parts=[Part(text=user_query)])

    runner = Runner(
        app_name="standalone_test",
        agent=agent,
        session_service=session_service,
        artifact_service=artifacts_service,
    )
    session = session_service.create_session(state={}, app_name="standalone_test", user_id="test_user")
    logger.info(f"Running agent with session: '{session}'")

    final_response = None
    # run_async はイベントの非同期イテレータを返す
    async for event in runner.run_async(session_id=session.id, user_id=session.user_id, new_message=message):
        logger.info(f"Agent Event: {event}")

        if event.content and event.content.parts:
            final_response = event.content.parts[0].text

    logger.info(f"Agent final response: {final_response}")
    return final_response or ""


# スクリプトとして直接実行された場合の処理
if __name__ == "__main__":
    try:
        character_agent = create_character_agent()
        # テスト用の質問
        test_query = "こんにちは！調子はどう？"
        # 非同期関数を実行
        asyncio.run(run_agent_standalone(character_agent, test_query))
    except ValueError as e:
        logger.error("run ValueError", exc_info=e)
    except Exception as e:
        logger.exception("run unexpected error occurred", exc_info=e)
