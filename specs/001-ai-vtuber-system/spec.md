# Feature Specification: AI V-Tuber 配信システム（ベースライン仕様）

**Feature Branch**: `001-ai-vtuber-system`

**Created**: 2026-07-12

**Status**: Baseline（現行システムの実装済み仕様を集約したもの）

**Input**: User description: "現行の AI V-Tuber システム（vtube-stage + vtuber-behavior-engine）の仕様を Spec Kit 形式で集約する"

## 概要

AI（大規模言語モデル）によって制御される複数の V-Tuber キャラクターが自律的に対話し、
VRM モデルの発話・表情・アニメーション・資料表示・カメラワークとして舞台上に表現され、
OBS 等を通じて配信可能になるシステム。

- **VTube Stage**: 舞台。VRM キャラクターの描画、VoiceVox による音声合成とリップシンク、
  Markdown 資料表示、カメラ制御を行う Electron アプリケーション。AI から舞台を操作するための
  MCP サーバーを内蔵する（SSE が既定、stdio も選択可）。
- **Behavior Engine**: 頭脳。Google ADK 上のマルチエージェントが番組進行・対話・演出判断を行い、
  MCP クライアントとして VTube Stage のツールを呼び出す。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI キャラクター同士の対話配信（ニュース番組） (Priority: P1)

配信者（システム運用者）が VoiceVox・VTube Stage・Behavior Engine を起動すると、
複数の AI キャラクター（例: ずんだもん、四国めたん）が最新ニュースを題材に自律的に会話を続け、
各キャラクターの VRM モデルが感情表現つきで発話（音声 + 口パク + 字幕相当のキャプション）する。

**Why this priority**: システムの中核価値。これが動けば「AI V-Tuber 配信」として成立する（MVP)。

**Independent Test**: VoiceVox → VTube Stage → Behavior Engine（news 設定）の順に起動し、
2 キャラクターが交互に音声つきで発話し続けることを目視・聴取で確認できる。

**Acceptance Scenarios**:

1. **Given** VoiceVox と VTube Stage が起動済み、**When** Behavior Engine を news 設定で起動する、
   **Then** キャラクターが挨拶から会話を開始し、各発話が VRM の口パクと同期した音声で再生される。
2. **Given** キャラクター A が発話中、**When** 次の発話指示が到着する、
   **Then** 現在の発話の完了（speakEnd）を待ってから次の発話が再生され、発話が重ならない。
3. **Given** 会話が継続中、**When** 発話に感情（happy/sad/angry 等）が指定される、
   **Then** 対応する表情（BlendShape）が VRM モデルに反映される。

---

### User Story 2 - プレゼンテーション配信（スライド + 資料表示） (Priority: P2)

配信者が presentation 設定で Behavior Engine を起動すると、AI キャラクターがスライド資料に
沿って解説を進め、舞台上に Markdown 形式の資料（見出し・箇条書き・表・画像）が表示される。

**Why this priority**: ニュース対話に次ぐ主要ユースケース。資料表示（display_markdown_text)
とスライド進行の組み合わせで「解説番組」を実現する。

**Independent Test**: presentation 設定で起動し、スライド JSON の内容が順に Markdown 表示され、
キャラクターの解説発話と同期して進行することを確認できる。

**Acceptance Scenarios**:

1. **Given** presentation 設定で起動済み、**When** エージェントがスライドを進める、
   **Then** 舞台の資料表示エリアに該当スライドの Markdown が描画される。
2. **Given** 資料が表示されている、**When** 次の資料表示指示が届く、**Then** 表示が新しい内容に置き換わる。

---

### User Story 3 - 演出制御（アニメーション・カメラワーク） (Priority: P3)

AI エージェントは会話の文脈に応じて、キャラクターのアニメーション（手を振る・同意・否定・
恐怖・勝利・パンチ）を発火させ、カメラ（デフォルト・イントロ・クローズアップ・全身・
ローアングル・ハイアングル・左右サイド）を切り替えて配信画面に変化をつける。

**Why this priority**: 配信の見栄えを高める演出要素。P1/P2 が成立していれば独立に追加検証できる。

**Independent Test**: MCP ツール `trigger_animation` / `control_camera` を直接呼び出し、
指定キャラクターのモーション再生とカメラ遷移（指定 duration での補間）を確認できる。

**Acceptance Scenarios**:

1. **Given** キャラクターが待機中、**When** アニメーション名を指定してトリガーする、
   **Then** 該当キャラクターの VRMA モーションが再生され、終了後に待機状態へ戻る。
2. **Given** カメラがデフォルト位置、**When** カメラモードと対象キャラクターを指定する、
   **Then** 指定時間かけてカメラが対象への構図へ滑らかに遷移する。

---

### User Story 4 - 視聴者インタラクション（音声認識） (Priority: P4)

設定（`use_speech_recognition`）を有効にすると、マイクからのユーザー発話が日本語音声認識で
テキスト化され、AI キャラクターが会話の中でユーザーの発言に反応する。

**Why this priority**: 対話性を高めるオプション機能。既定では無効であり、P1〜P3 と独立。

**Independent Test**: 音声認識を有効化して起動し、マイクへの発話内容がエージェントの
応答に反映されることを確認できる。

**Acceptance Scenarios**:

1. **Given** 音声認識が有効で配信中、**When** ユーザーがマイクに向かって話す、
   **Then** 認識されたテキストがエージェントの入力に取り込まれ、キャラクターが内容に言及する。
2. **Given** 音声認識が無効（既定）、**When** システムを起動する、
   **Then** 音声入力なしで会話が自律進行する（ダミーツールが使用される）。

---

### Edge Cases

- 発話完了通知（speakEnd）が返らない場合: コマンドキューは 30 秒でタイムアウトし、
  システムは停止せず次の処理へ進む。
- 不正・未知のコマンドを受信した場合: バリデーション（validateStageCommand）で弾かれ、
  警告ログのみで表示層には影響しない。
- VoiceVox が未起動・TTS 無効（`VITE_TTS_ENABLED=false`）の場合: 音声なしのダミー待機で
  進行し、会話フロー自体は止まらない。
- 指定された `character_id` が存在しない場合: 該当コマンドは対象なしとして無視され、
  他キャラクターの進行に影響しない。
- MCP 接続先（VTube Stage）が未起動の場合: Behavior Engine はツール取得に失敗して
  エラーを報告する（舞台演出は実行できない）。

## Requirements *(mandatory)*

### Functional Requirements

#### 発話・表現

- **FR-001**: システムは、指定キャラクターにメッセージを発話させることができなければならない。
  発話には感情（neutral / happy / sad / angry / relaxed / surprised）と音声スタイル
  （ノーマル / あまあま / ツンツン / セクシー / ささやき / ヒソヒソ）を指定できる。
- **FR-002**: 発話は音声合成（VoiceVox）で再生され、音声再生中は VRM モデルの口が同期して動く
  （リップシンク）こと。感情は VRM の表情（BlendShape）に反映されること。
- **FR-003**: 発話には画面表示用のキャプションを添えられること。
- **FR-004**: 発話は完了同期されること。すなわち、1 つの発話が完了（speakEnd）するまで
  次の発話指示はブロックされ、発話が重ならないこと。
- **FR-005**: システムは、指定キャラクターの定義済みアニメーション
  （wave / agree / no / fear / victory / punch）を再生できなければならない。
- **FR-006**: システムは、Markdown 形式のテキスト（GFM: 表・リスト等を含む）を舞台上に
  表示・更新できなければならない。
- **FR-007**: システムは、カメラモード（default / intro / closeUp / fullBody / lowAngle /
  highAngle / sideRight / sideLeft）と対象キャラクター・遷移時間を指定してカメラを
  制御できなければならない。
- **FR-008**: VRM キャラクターは自動でまばたきし、視線制御（LookAt）が機能すること。

#### AI エージェント

- **FR-009**: 複数の AI キャラクターエージェントが、思考（発話内容の生成）と出力（舞台への
  発話実行）を分離したパイプラインで、設定された回数まで会話ループを継続できること。
- **FR-010**: ニュース番組モードでは、Web 検索（Google Search）で取得した最新情報を会話の
  題材として導入・更新できること。
- **FR-011**: プレゼンテーションモードでは、スライド定義（JSON）に沿って進行し、必要に応じて
  画像生成を利用できること。
- **FR-012**: 会話の文脈・記憶を保持し、過去の会話内容を想起（recall）して発話に反映できること。
- **FR-013**: 音声認識は設定でオン/オフを切り替えられ、有効時はマイク入力の日本語発話を
  ストリーミング認識してエージェント入力に供給できること。

#### 接続・契約

- **FR-014**: VTube Stage は AI からの操作を受け付ける MCP サーバーを内蔵し、SSE（既定、
  ホスト/ポートは環境変数で設定、既定 127.0.0.1:8080）と stdio（`--transport=stdio`）の
  両トランスポートで起動できること。
- **FR-015**: Behavior Engine は MCP クライアントとして VTube Stage に接続し
  （接続先 URL は環境変数 `STAGE_DIRECTOR_MCP_SERVER_URL`）、公開ツールを取得して呼び出せること。
- **FR-016**: 表示層に渡るすべての Stage コマンドはスキーマ検証を通過しなければならず、
  未知のコマンド・不正な payload は破棄され警告ログが記録されること。
- **FR-017**: キャラクター構成は定義ファイル（`avatars.json` + キャラクター定義 XML +
  設定 YAML）で宣言的に追加・変更でき、コード変更なしにキャラクターを追加できること。

### Key Entities

- **キャラクター（Avatar）**: 配信に登場する V-Tuber。`character_id` で識別され、VRM モデル・
  アニメーション一覧・人格プロンプト（XML）・VoiceVox 話者を持つ。
- **MCP ツール**: AI が舞台を操作する唯一のインターフェース。`speak` / `trigger_animation` /
  `display_markdown_text` / `control_camera` の 4 種。
- **StageCommand**: MCP サーバーから renderer へ渡される JSON コマンド契約
  （`speak` / `triggerAnimation` / `displayMarkdown` / `controlCamera` / `logMessage`）。
- **speakId / speakEnd**: 発話の完了同期に使う識別子とイベント。コマンドキューが
  `speakId` をキーに待機・通知する。
- **エージェント構成**: ルートの逐次パイプライン（初期文脈 → 会話ループ）。会話ループは
  記憶想起 → 各キャラクターの思考/出力 → 文脈更新で構成される。
- **番組設定（Config）**: 番組モードごとの YAML（news / presentation）。参加キャラクター、
  最大ループ回数、音声認識の有効/無効などを定義する。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 運用者が 3 手順（VoiceVox → VTube Stage → Behavior Engine）の起動だけで、
  人手の介入なしに AI キャラクター同士の会話配信を開始できる。
- **SC-002**: 発話の音声・口パク・字幕・表情が同一タイミングで提示され、発話の重なり
  （2 キャラクター同時発声）が発生しない。
- **SC-003**: 設定された会話ループ回数（例: news 20 回）を、クラッシュや停止なしに完走できる。
- **SC-004**: 不正なコマンド・未知のコマンドが表示層の描画を破壊することがない（検証で 100% 遮断）。
- **SC-005**: キャラクターの追加が、定義ファイルの追加・編集のみ（アプリケーションコードの
  変更なし）で完了する。

## Assumptions

- ローカル PC 上での起動を前提とする（VoiceVox・OBS Studio は別プロセスとして運用者が用意）。
- 配信映像の取り込みは OBS のウィンドウキャプチャで行う（obs-websocket による自動制御は未実装）。
- LLM は Google Gemini（API キー必須）を使用する。音声認識を使う場合は Google Cloud Speech の
  認証情報が別途必要。
- 本仕様は現行実装のベースラインを記述したものであり、今後の機能追加は本仕様を前提に
  `/speckit-specify` で個別の feature spec として作成する。
