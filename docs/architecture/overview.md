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
    - MCP Client として `vtube-stage` (Electron) に接続し、ツール（発話、アニメーション等）を呼び出す。
2.  **vtube-stage (Electron Renderer/Stage)**:
    - Electron 上で MCP Server (SSE) を提供し、AI からのツール呼び出しを受理。
    - React + Three.js + @pixiv/three-vrm による 3D 描画。
    - VoiceVox 等の TTS エンジンと連携した音声再生。
    - Electron IPC で受け取ったコマンドに基づき、キャラクターを制御。

### 2.2. コンポーネントの責任範囲

| コンポーネント             | 責任                                                      | 主要技術                            |
| :------------------------- | :-------------------------------------------------------- | :---------------------------------- |
| **vtuber-behavior-engine** | シナリオ制御、対話生成、ツール選択、感情決定              | Python, Google ADK, MCP Client      |
| **vtube-stage**            | MCP ツール公開、VRM 描画、TTS 再生、リップシンク、Markdown 表示、OBS 連携 | TypeScript, Electron, React, Three.js |

## 3. 動作原理

1.  **AI の思考**: `vtuber-behavior-engine` 内のエージェントが「何を話すか」「どんな表情をするか」を決定し、MCP ツールを呼び出す。
2.  **コマンド変換**: `vtube-stage` (Electron MCP サーバー) がツール呼び出しを JSON 形式の `StageCommand` に変換し、IPC 経由でレンダラへ送る。
3.  **演出の実行**: `vtube-stage` レンダラがコマンドを解析し、VRM モデルのアニメーションを開始したり、TTS で音声を再生したりする。
4.  **完了通知**: 発話などが終了すると、レンダラは `speakEnd` イベントを MCP サーバーへ返し、AI は次の行動へ移る。

## 4. アーキテクチャ図

```mermaid
graph LR
  subgraph AI_Backend[AI Backend]
    VBE[vtuber-behavior-engine\n(ADK Agents)]
  end

  subgraph StageApp[Desktop & Services]
    VS[vtube-stage (Electron)\nMCP Server + Renderer]
    VV[VoiceVox\n(TTS Service)]
    OBS[OBS Studio\n(Capture)]
  end

  VBE -- MCP (SSE) --> VS
  VS -- HTTP --> VV
  VS -- Window Capture --> OBS
```
