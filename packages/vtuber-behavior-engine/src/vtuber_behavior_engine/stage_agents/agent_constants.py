#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

AGENT_SYSTEM_AAP_NAME = "ai_vtuber_stage_director"
AGENT_SYSTEM_USER_ID = "vtuber_user"

CONVERSATION_RECALL_LLM_MODEL = "gemini-3.1-flash-lite"
# AGENT_LLM_MODEL = "gemini-3.5-flash"
AGENT_LLM_MODEL = "gemini-3.1-flash-lite"
OUTPUT_LLM_MODEL = "gemini-3.1-flash-lite"
# OUTPUT_LLM_MODEL = LiteLlm("ollama_chat/gemma3:27b")


# --- State Keys ---
STATE_CONVERSATION_CONTEXT = "conversation_context"
STATE_CONVERSATION_RECALL = "conversation_recall"
STATE_AGENT_SPEECH_BASE = "agent_speech_"
STATE_CURRENT_TIME = "current_time"
STATE_DISPLAY_MARKDOWN_TEXT = "display_markdown_text"
STATE_USER_SPEECH = "user_speech"
