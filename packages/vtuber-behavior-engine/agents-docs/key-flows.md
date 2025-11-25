<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 主要な機能フロー

## エントリーポイント

### スタンドアロン実行フロー

**ファイル**: `src/vtuber_behavior_engine/main.py`

```python
async def main() -> None:
    from vtuber_behavior_engine.news_agent.agent import root_agent

    exit_stack: AsyncExitStack | None = None
    try:
        agent_tuple = await root_agent
        if agent_tuple is None:
            logger.error("Failed to create root agent.")
            raise Exception("Failed to create root agent.")
        character_agent, exit_stack = agent_tuple
        # initial message
        message = initial_message()
        await run_agent_standalone(character_agent, message)
    finally:
        if exit_stack is not None:
            await exit_stack.aclose()
```

### 初期化シーケンス

```mermaid
sequenceDiagram
    participant Main as main.py
    participant NewsAgent as news_agent/agent.py
    participant Builder as news_root_agent_builder
    participant MCPClient as StageDirectorMCPClient
    participant SpeechTool as SpeechRecognitionTool
    participant Runner as agent_runner

    Main->>NewsAgent: import root_agent
    NewsAgent->>Builder: await build_root_news_agent()
    Builder->>MCPClient: create_async(exit_stack)
    MCPClient-->>Builder: mcp_client
    Builder->>SpeechTool: __init__()
    Builder->>SpeechTool: start_recognition()
    SpeechTool-->>Builder: バックグラウンドスレッド開始
    Builder->>Builder: create agents
    Builder-->>NewsAgent: (root_agent, exit_stack)
    NewsAgent-->>Main: (root_agent, exit_stack)
    Main->>Runner: run_agent_standalone(agent, message)
```

### 関連ファイル

- `src/vtuber_behavior_engine/main.py` - メインエントリーポイント
- `src/vtuber_behavior_engine/agent_runner.py` - ADK Runner ラッパー
- `src/vtuber_behavior_engine/news_agent/agent.py` - ニュースエージェントファクトリー
- `src/vtuber_behavior_engine/stage_agents/news/news_root_agent_builder.py` - Root Agent ビルダー

### 処理の流れ

1. `main.py` がエージェントをインポート（`news_agent.agent.root_agent`）
2. `build_root_news_agent()` で Root Agent を構築
3. Stage Director MCP Client を初期化
4. 音声認識ツールをバックグラウンドで開始
5. エージェントパイプライン（Initial Context → Conversation Loop）を構築
6. `run_agent_standalone()` で実行開始
7. 初期メッセージをエージェントに送信

---

## ユースケース 1: ニュース解説フロー

### 概要

2 人の AI キャラクターがニュース記事について対話・解説を行う。

### シーケンス図

```mermaid
sequenceDiagram
    participant Runner as ADK Runner
    participant RootAgent as Root Agent
    participant InitCtx as Initial News Context
    participant ConvLoop as Conversation Loop
    participant Recall as Recall Agent
    participant Char1Think as Character1 Thought
    participant Char1Out as Character1 Output
    participant MCP as MCP Client
    participant StageDir as Stage Director
    participant Memory as Chroma Memory

    Runner->>RootAgent: run_async(initial_message)

    %% Initial Context
    RootAgent->>InitCtx: 初期コンテキスト設定
    InitCtx->>InitCtx: fetch news from RSS
    InitCtx->>InitCtx: set STATE_CONVERSATION_CONTEXT
    InitCtx-->>RootAgent: context set

    %% Conversation Loop
    RootAgent->>ConvLoop: 会話ループ開始

    loop max_iterations
        %% Recall
        ConvLoop->>Recall: 過去の会話を想起
        Recall->>Memory: search_memory("今日のニュース")
        Memory-->>Recall: 過去の関連会話
        Recall->>Recall: set STATE_CONVERSATION_RECALL

        %% Character 1
        ConvLoop->>Char1Think: キャラクター1の思考
        Char1Think->>Char1Think: get_user_speech() (音声認識)
        Char1Think->>Char1Think: generate response with LLM
        Char1Think->>Char1Think: set STATE_AGENT_SPEECH_character1

        ConvLoop->>Char1Out: キャラクター1の出力
        Char1Out->>Char1Out: get AgentSpeech from state
        Char1Out->>MCP: speak(AgentSpeech)
        MCP->>StageDir: call_tool("speak", {...})
        StageDir-->>MCP: speaking...
        Char1Out->>Char1Out: clear STATE_DISPLAY_MARKDOWN_TEXT

        %% Character 2 (同様)
        ConvLoop->>ConvLoop: キャラクター2も同様に思考→出力

        %% Update Context
        ConvLoop->>ConvLoop: update context (時刻、ユーザー発話など)
    end

    RootAgent->>Memory: add_session_to_memory()
    RootAgent-->>Runner: 完了
```

### 関連ファイル

- `src/vtuber_behavior_engine/stage_agents/news/news_root_agent_builder.py` - ニュース用 Root Agent 構築
- `src/vtuber_behavior_engine/stage_agents/news/news_context_agent.py` - ニュースコンテキスト管理
- `src/vtuber_behavior_engine/stage_agents/character_agent.py` - キャラクター思考・出力
- `src/vtuber_behavior_engine/services/stage_director_mcp_client.py` - Stage Director 連携
- `src/vtuber_behavior_engine/services/news_provider.py` - ニュース取得

### 処理の流れ

1. **Initial News Context Agent** がニュース記事を RSS から取得し、`STATE_CONVERSATION_CONTEXT` に設定
2. **Conversation Loop** 開始（最大反復回数まで）
3. **Conversation Recall Agent** が過去の会話を検索して想起
4. **Character1 Thought Agent** がキャラクター 1 の思考を生成
   - 音声認識ツールでユーザー発話を取得
   - LLM でニュースに対するコメントを生成
   - `STATE_AGENT_SPEECH_character1` に保存
5. **Character1 Output Agent** が発話を Stage Director に送信
   - `AgentSpeech` を取得
   - MCP Client で `speak` ツールを呼び出し
   - 画面表示テキストをクリア
6. **Character2** も同様に思考 → 出力
7. **Update Context Agent** がコンテキストを更新（時刻、ユーザー発話など）
8. ループ終了後、セッションをメモリに保存

---

## ユースケース 2: プレゼンテーションフロー

### 概要

2 人の AI キャラクターがスライド資料に基づいてプレゼンテーションを行う。

### シーケンス図

```mermaid
sequenceDiagram
    participant Runner as ADK Runner
    participant RootAgent as Root Agent
    participant InitCtx as Initial Presentation Context
    participant ConvLoop as Conversation Loop
    participant Char1Think as Character1 Thought
    participant Char1Out as Character1 Output
    participant MCP as MCP Client
    participant StageDir as Stage Director

    Runner->>RootAgent: run_async(initial_message="Start")

    %% Initial Context
    RootAgent->>InitCtx: 初期コンテキスト設定
    InitCtx->>InitCtx: load slides from JSON
    InitCtx->>InitCtx: set STATE_CONVERSATION_CONTEXT
    InitCtx-->>RootAgent: context set

    %% Conversation Loop
    RootAgent->>ConvLoop: 会話ループ開始

    loop until presentation ends
        ConvLoop->>Char1Think: キャラクター1の思考
        Char1Think->>Char1Think: generate presentation speech
        Char1Think->>Char1Think: set STATE_AGENT_SPEECH_character1
        Char1Think->>Char1Think: set STATE_DISPLAY_MARKDOWN_TEXT (slide content)

        ConvLoop->>Char1Out: キャラクター1の出力
        Char1Out->>MCP: display_markdown_text(slide)
        MCP->>StageDir: call_tool("display_markdown_text")
        StageDir-->>MCP: displayed
        Char1Out->>MCP: speak(AgentSpeech)
        MCP->>StageDir: call_tool("speak")
        StageDir-->>MCP: speaking...

        ConvLoop->>ConvLoop: キャラクター2も同様
        ConvLoop->>ConvLoop: update context (次のスライドへ)
    end

    RootAgent-->>Runner: 完了
```

### 関連ファイル

- `src/vtuber_behavior_engine/stage_agents/presentation/presentation_root_agent_builder.py` - プレゼンテーション用 Root Agent
- `src/vtuber_behavior_engine/stage_agents/presentation/presentation_context_agent.py` - プレゼンテーションコンテキスト管理
- `src/vtuber_behavior_engine/stage_agents/presentation/presentation_models.py` - プレゼンテーション用モデル
- `src/vtuber_behavior_engine/stage_agents/resources/presentation/slides/` - スライド JSON ファイル

### 処理の流れ

1. **Initial Presentation Context Agent** がスライド JSON を読み込み、`STATE_CONVERSATION_CONTEXT` に設定
2. **Conversation Loop** 開始
3. **Character1 Thought Agent** がスライド内容に基づいてプレゼンテーション発話を生成
   - `STATE_AGENT_SPEECH_character1` に保存
   - `STATE_DISPLAY_MARKDOWN_TEXT` にスライド内容を設定
4. **Character1 Output Agent** がスライドを表示し、発話を実行
   - `display_markdown_text` でスライド表示
   - `speak` で発話
5. **Character2** も同様
6. **Update Context Agent** が次のスライドに進む
7. すべてのスライドを消化したらループ終了

---

## ユースケース 3: 音声認識統合フロー

### 概要

ユーザーの発話をリアルタイムで認識し、キャラクターの対話に反映させる。

### シーケンス図

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant SpeechTool as SpeechRecognitionTool
    participant Manager as SpeechRecognitionManager
    participant GoogleSTT as Google Cloud STT
    participant CharThink as Character Thought Agent
    participant UpdateCtx as Update Context Agent

    %% 起動時
    SpeechTool->>Manager: start_recognition()
    Manager->>Manager: バックグラウンドスレッド開始
    Manager->>GoogleSTT: streaming_recognize()

    %% ユーザー発話
    User->>GoogleSTT: 音声入力
    GoogleSTT->>Manager: transcript (interim)
    Manager->>Manager: キューに蓄積
    GoogleSTT->>Manager: transcript (final)
    Manager->>Manager: キューに追加

    %% エージェントが発話を取得
    CharThink->>CharThink: before_model_callback
    CharThink->>SpeechTool: get_transcripts()
    SpeechTool->>Manager: get_transcripts()
    Manager-->>SpeechTool: ["ユーザー発話"]
    SpeechTool-->>CharThink: transcripts
    CharThink->>CharThink: set STATE_USER_SPEECH
    CharThink->>CharThink: generate response

    %% コンテキスト更新
    UpdateCtx->>UpdateCtx: get STATE_USER_SPEECH
    UpdateCtx->>UpdateCtx: update STATE_CONVERSATION_CONTEXT
    UpdateCtx->>UpdateCtx: clear STATE_USER_SPEECH
```

### 関連ファイル

- `src/vtuber_behavior_engine/services/speech_recognition.py` - 音声認識ツールとマネージャー
- `src/vtuber_behavior_engine/stage_agents/character_agent.py` - `get_user_speech` コールバック
- `src/vtuber_behavior_engine/stage_agents/news/news_context_agent.py` - ユーザー発話をコンテキストに統合

### 処理の流れ

1. **SpeechRecognitionManager** がバックグラウンドスレッドを開始
2. Google Cloud Speech API でストリーミング認識
3. 確定した発話（`is_final=True`）をキューに蓄積
4. **Character Thought Agent** の `before_model_callback` でユーザー発話を取得
5. `STATE_USER_SPEECH` に保存
6. LLM がユーザー発話を考慮して応答生成
7. **Update Context Agent** がユーザー発話を会話コンテキストに統合
8. `STATE_USER_SPEECH` をクリア

---

## ユースケース 4: メモリ検索・想起フロー

### 概要

過去の会話をベクトル検索で想起し、現在の対話に反映させる。

### シーケンス図

```mermaid
sequenceDiagram
    participant Recall as Conversation Recall Agent
    participant Memory as Chroma Memory Service
    participant Chroma as Chroma DB
    participant Gemini as Gemini API
    participant CharThink as Character Thought Agent

    %% 想起フェーズ
    Recall->>Recall: get STATE_CONVERSATION_CONTEXT
    Recall->>Memory: search_memory(query="今日のニュース")
    Memory->>Gemini: embed(query)
    Gemini-->>Memory: embedding vector
    Memory->>Chroma: query(embedding, n_results=10)
    Chroma-->>Memory: similar documents
    Memory-->>Recall: MemoryEntry[]
    Recall->>Recall: format as text
    Recall->>Recall: set STATE_CONVERSATION_RECALL

    %% 思考フェーズ
    CharThink->>CharThink: get STATE_CONVERSATION_RECALL
    CharThink->>CharThink: include in prompt
    CharThink->>CharThink: generate response with recall

    %% 保存フェーズ
    Note over Memory: セッション終了時
    Memory->>Memory: add_session_to_memory(session)
    Memory->>Gemini: embed(conversation)
    Gemini-->>Memory: embedding vector
    Memory->>Chroma: add(documents, embeddings, metadata)
```

### 関連ファイル

- `src/vtuber_behavior_engine/stage_agents/conversation_context_agent.py` - Conversation Recall Agent
- `src/vtuber_behavior_engine/services/memory/chroma_memory_service.py` - Chroma Memory Service
- `src/vtuber_behavior_engine/agent_runner.py` - セッション保存

### 処理の流れ

1. **Conversation Recall Agent** が現在の話題を取得（`STATE_CONVERSATION_CONTEXT`）
2. **ChromaMemoryService** に検索クエリを送信
3. Gemini API でクエリを埋め込みベクトル化
4. Chroma DB でベクトル類似度検索（上位 10 件）
5. 検索結果をテキスト形式で整形
6. `STATE_CONVERSATION_RECALL` に保存
7. **Character Thought Agent** がリコール内容をプロンプトに含めて応答生成
8. セッション終了時、全ての会話イベントを Chroma DB に保存

---

## ユースケース 5: Stage Director 連携フロー

### 概要

生成した発話データを MCP プロトコルで Stage Director に送信し、キャラクターを制御する。

### シーケンス図

```mermaid
sequenceDiagram
    participant CharOut as Character Output Agent
    participant MCP as StageDirectorMCPClient
    participant Session as MCP Session
    participant StageDir as Stage Director (MCP Server)
    participant VTuber as VTuber 画面

    %% ツール取得
    MCP->>Session: create_session()
    MCP->>Session: list_tools()
    Session->>StageDir: list_tools request
    StageDir-->>Session: ["speak", "display_markdown_text", "trigger_animation"]
    Session-->>MCP: tools

    %% 発話実行
    CharOut->>CharOut: get STATE_AGENT_SPEECH_character1
    CharOut->>CharOut: parse as AgentSpeech
    CharOut->>MCP: speak(speech, markdown_text)

    alt markdown_text is not None
        MCP->>Session: call_tool("display_markdown_text", {text})
        Session->>StageDir: display_markdown_text request
        StageDir->>VTuber: オーバーレイ表示
        VTuber-->>StageDir: displayed
        StageDir-->>Session: result
    end

    MCP->>MCP: create_task(speak_all)

    loop for each speech item
        MCP->>Session: call_tool("speak", {message, emotion, ...})
        Session->>StageDir: speak request
        StageDir->>VTuber: 音声合成＋字幕表示
        VTuber-->>StageDir: speaking...
        StageDir-->>Session: result
    end

    MCP-->>CharOut: speak task completed
```

### 関連ファイル

- `src/vtuber_behavior_engine/services/stage_director_mcp_client.py` - MCP クライアント
- `src/vtuber_behavior_engine/stage_agents/character_agent.py` - Character Output Agent
- `src/vtuber_behavior_engine/stage_agents/models.py` - AgentSpeech モデル

### 処理の流れ

1. **StageDirectorMCPClient** が MCP Server に接続
2. 利用可能なツール一覧を取得（`speak`, `display_markdown_text`, `trigger_animation`）
3. **Character Output Agent** が `STATE_AGENT_SPEECH_character1` から `AgentSpeech` を取得
4. 画面表示テキストがあれば `display_markdown_text` を呼び出し
5. `speak` ツールをバックグラウンドタスクで実行
6. 各発話アイテムについて：
   - `tts_text`: 音声合成用テキスト
   - `caption`: 字幕用テキスト
   - `emotion`: 感情表現（`neutral`, `happy`, `sad`, `angry`, `excited`）
7. Stage Director が VTuber 画面に反映（音声合成、字幕表示、アニメーション）
8. 前のタスクが完了するまで待機してから次の発話を実行

---

## エラーハンドリングフロー

### MCP 接続エラー

```python
try:
    stage_director_client = await StageDirectorMCPClient.create_async(exit_stack)
except ValueError as e:
    logger.error("STAGE_DIRECTOR_MCP_SERVER_URL is not set.", exc_info=e)
    raise
```

### 音声認識エラー

```python
try:
    speech_tool.start_recognition()
except Exception as e:
    logger.error(f"Failed to start speech recognition: {e}", exc_info=e)
    # 音声認識なしで続行
```

### LLM 出力バリデーションエラー

```python
# AgentSpeech として parse できない場合は ADK が自動的にリトライ
agent = LlmAgent(
    output_schema=AgentSpeech,  # Pydantic モデルで検証
)
```

### セッション保存エラー

```python
try:
    await memory_service.add_session_to_memory(completed_session)
except Exception as e:
    logger.error(f"Failed to save session to memory: {e}", exc_info=e)
    # 保存失敗しても続行
```
