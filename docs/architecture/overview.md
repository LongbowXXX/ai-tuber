<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# システム概要 (System Overview)

## 1. はじめに

### 1.1. 目的

本プロジェクトは、Google ADK（マルチエージェントフレームワーク）と MCP（Model Context Protocol）を統合し、AI による対話・行動生成をリアルタイムに VRM キャラクターの表現（発話、表情、アニメーション、情報表示）へ変換する V-Tuber 配信システムを構築することを目的としています。

### 1.2. スコープ

- **AI コア**: ニュース読み上げや対話などのシナリオに基づく行動生成。
- **舞台監督 (Director)**: AI の意図を具体的な演出コマンドに変換し、配信ステージへ中継。
- **配信ステージ (Stage)**: VRM モデルの描画、音声合成 (TTS)、Markdown テキストの表示。
- **外部連携**: OBS Studio 等の配信ソフトへの映像出力（ウィンドウキャプチャ前提）。

## 2. システム構成

### 2.1. コンポーネント概要

システムは以下の 3 つの主要コンポーネントで構成されます。

1.  **vtuber-behavior-engine (AI Core)**:
    - Google ADK を使用したマルチエージェントシステム。
    - MCP Client として `stage-director` に接続し、ツール（発話、アニメーション等）を呼び出す。
2.  **stage-director (Hub/Director)**:
    - MCP Server (SSE) を提供し、AI からのツール呼び出しを受理。
    - WebSocket Server を提供し、`vtube-stage` へ演出コマンドをリアルタイム送信。
    - コマンドのキューイングと完了同期 (`speakEnd` 等) を管理。
3.  **vtube-stage (Renderer/Stage)**:
    - React + Three.js + @pixiv/three-vrm による 3D 描画。
    - VoiceVox 等の TTS エンジンと連携した音声再生。
    - WebSocket で受信したコマンドに基づき、キャラクターを制御。

### 2.2. コンポーネントの責任範囲

| コンポーネント             | 責任                                                      | 主要技術                       |
| :------------------------- | :-------------------------------------------------------- | :----------------------------- |
| **vtuber-behavior-engine** | シナリオ制御、対話生成、ツール選択、感情決定              | Python, Google ADK, MCP Client |
| **stage-director**         | ツール定義の公開、コマンドの正規化、WS 配信、完了待機     | Node.js, TypeScript, ws, @mcp/sdk |
| **vtube-stage**            | VRM 描画、TTS 再生、リップシンク、Markdown 表示、OBS 連携 | TypeScript, React, Three.js    |

## 3. 動作原理

1.  **AI の思考**: `vtuber-behavior-engine` 内のエージェントが「何を話すか」「どんな表情をするか」を決定し、MCP ツールを呼び出す。
2.  **コマンド変換**: `stage-director` がツール呼び出しを JSON 形式の `StageCommand` に変換し、WebSocket 経由で `vtube-stage` へ送る。
3.  **演出の実行**: `vtube-stage` がコマンドを解析し、VRM モデルのアニメーションを開始したり、TTS で音声を再生したりする。
4.  **完了通知**: 発話などが終了すると、`vtube-stage` は `speakEnd` イベントを `stage-director` へ返し、AI は次の行動へ移る。

## 4. アーキテクチャ図

```mermaid
graph LR
  subgraph AI_Backend[AI Backend]
    VBE[vtuber-behavior-engine\n(ADK Agents)]
    SD[stage-director\n(MCP Server + WebSocket)]
  end

  subgraph Frontend[Frontend & Services]
    VS[vtube-stage\n(React + Three.js)]
    VV[VoiceVox\n(TTS Service)]
    OBS[OBS Studio\n(Capture)]
  end

  VBE -- MCP (SSE) --> SD
  SD -- WebSocket --> VS
  VS -- HTTP --> VV
  VS -- Window Capture --> OBS
```
