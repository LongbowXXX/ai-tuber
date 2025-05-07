#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from google.adk.models.lite_llm import LiteLlm

# AGENT_LLM_MODEL = "gemini-2.0-flash"

INITIAL_TOPIC_LLM_MODEL = LiteLlm("ollama_chat/gemma3:27b")
UPDATE_TOPIC_LLM_MODEL = "gemini-2.0-flash"
AGENT_LLM_MODEL = "gemini-2.5-flash-preview-04-17"
OUTPUT_LLM_MODEL = "gemini-2.0-flash"
