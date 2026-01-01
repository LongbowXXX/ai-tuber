# バグ修正計画: KeyError: 'Context variable not found: user_speech'

<!-- この文書は @Debugger により生成されました -->
<!-- See: knowledge/guidelines/debugging.md -->

> **Status**: Draft
> **Author**: @Debugger
> **Date**: 2026-01-01

## 1. 問題の説明

### 症状

1. アプリケーション起動時に `KeyError: 'Context variable not found: user_speech'.` が発生し、エージェントの実行が停止する。
2. `user_speech` 修正後、`ValueError: Function google_search is not found in the tools_dict: dict_keys([]).` が発生する。

### 影響

- High: アプリケーションが正常に起動・動作しない。

## 2. 手法（科学的方法）

### 観察

- `character_prompt.md` および `update_context.md` で `{user_speech}` が使用されている。
- `character_agent.py` の `get_user_speech` コールバックは、音声認識結果がある場合のみ `user_speech` を状態に設定する。
- 初回実行時や音声入力がない場合、`user_speech` が状態に設定されないままプロンプトの置換が行われる。
- `google_search` は ADK の `GoogleSearchTool` であり、Gemini の Grounding 機能として動作するが、プロンプトで「`google_search` ツールを呼び出せ」と明示的に指示されると、モデルが関数呼び出し（Function Call）を試みる。ADK の `LlmAgent` は `GoogleSearchTool` を関数ツールとして登録しないため、関数呼び出しが発生すると `ValueError` になる。

### 仮説

1. プロンプトテンプレートで使用されている変数（特に `user_speech`）がセッション状態に初期化されていないため、ADK がプロンプトを生成する際に `KeyError` をスローする。
2. プロンプト内の「`google_search` ツール」という表現がモデルに Function Call を強制しており、ADK のツール管理ロジックと不整合を起こしている。

### Experiment (Reproduction)

- **KeyError**: `reproduce_bug.py` で再現確認済み。
- **ValueError**: `main.py` の実行により再現確認済み。

## 3. 根本原因分析

### 診断

- **KeyError**: `get_user_speech` コールバックおよび `agent_runner.py` での初期状態不足。
- **ValueError**: プロンプトによる過度なツール呼び出し指示と、ADK における `GoogleSearchTool` の扱い（Grounding vs Function Call）の不一致。

## 4. 修正案

### 修正方針

1. `STATE_USER_SPEECH` を共通定数化し、セッション開始時に初期化する。
2. `character_agent.py` の `get_user_speech` で状態の存在を保証する。
3. `news_context_agent.py` の `ContextUpdater` から不要な `speech_tool` を削除する。
4. プロンプト（`initial_context.md`, `update_context.md`）から「`google_search` ツール」という具体的なツール名への言及を避け、「Google 検索」という一般的な表現に変更することで、モデルが Function Call ではなく Grounding 機能を使用するように誘導する。

### 変更内容

#### 1. [src/vtuber_behavior_engine/stage_agents/agent_constants.py](src/vtuber_behavior_engine/stage_agents/agent_constants.py)

- `STATE_USER_SPEECH` を追加。

#### 2. [src/vtuber_behavior_engine/stage_agents/news/news_agent_constants.py](src/vtuber_behavior_engine/stage_agents/news/news_agent_constants.py)

- 重複する `STATE_USER_SPEECH` を削除。

#### 3. [src/vtuber_behavior_engine/agent_runner.py](src/vtuber_behavior_engine/agent_runner.py)

- セッション作成時に `STATE_USER_SPEECH` 等を空で初期化。

#### 4. [src/vtuber_behavior_engine/stage_agents/character_agent.py](src/vtuber_behavior_engine/stage_agents/character_agent.py)

- `get_user_speech` で状態の初期化チェックを追加。

#### 5. [src/vtuber_behavior_engine/stage_agents/news/news_context_agent.py](src/vtuber_behavior_engine/stage_agents/news/news_context_agent.py)

- `ContextUpdater` の `tools` から `speech_tool` を削除。

#### 6. プロンプトテンプレート

- `initial_context.md`, `update_context.md` 内の `google_search` ツールへの言及を「Google 検索」に変更。

## 5. 検証結果

- `verify_fix.py` により `KeyError` の解消を確認。
- `main.py` の実行により `ValueError` の解消と、Google 検索 Grounding を利用した対話生成の継続を確認。

## 5. 検証計画

- [ ] `reproduce_bug.py` を修正後のコードで実行し、エラーが発生しないことを確認する。
- [ ] `uv run python src/vtuber_behavior_engine/main.py` を実行し、正常に動作することを確認する。
- [ ] 既存のテスト `pytest` を実行し、デグレードがないことを確認する。
