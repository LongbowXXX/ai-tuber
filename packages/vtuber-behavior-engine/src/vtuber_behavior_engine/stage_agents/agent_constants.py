#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

AGENT_SYSTEM_AAP_NAME = "ai_vtuber_stage_director"
AGENT_SYSTEM_USER_ID = "vtuber_user"

CONVERSATION_RECALL_LLM_MODEL = "gemini-2.0-flash"
# AGENT_LLM_MODEL = "gemini-2.5-flash-preview-04-17"
AGENT_LLM_MODEL = "gemini-2.5-flash-preview-05-20"
OUTPUT_LLM_MODEL = "gemini-2.0-flash"
# OUTPUT_LLM_MODEL = LiteLlm("ollama_chat/gemma3:27b")


# --- State Keys ---
STATE_CONVERSATION_CONTEXT = "conversation_context"
STATE_CONVERSATION_RECALL = "conversation_recall"
STATE_AGENT_SPEECH_BASE = "agent_speech_"
STATE_CURRENT_TIME = "current_time"
STATE_DISPLAY_MARKDOWN_TEXT = "display_markdown_text"

AGENT1_CHARACTER_ID = "avatar1"
AGENT2_CHARACTER_ID = "avatar2"
