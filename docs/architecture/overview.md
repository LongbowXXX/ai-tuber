<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# システム概要 (System Overview)

## 1. はじめに

### 1.1. 目的

本プロジェクトは、Google ADK（マルチエージェントフレームワーク）と MCP（Model Context Protocol）を統合し、AI による対話・行動生成をリアルタイムに VRM キャラクターの表現（発話、表情、アニメーション、情報表示）へ変換する V-Tuber 配信システムを構築することを目的としています。

### 1.2. スコープ

- **AI コア**: ニュース読み上げや対話などのシナリオに基づく行動生成。
- **配信ステージ (Stage)**: Electron デスクトップアプリとして、MCP サーバー機能、VRM モデルの描画、音声合成 (TTS)、Markdown テキストの表示を統合。
- **外部連携**: OBS Studio 等の配信ソフトへの映像出力（ウィンドウキャプチャ前提）。

## 2. システム構成

### 2.1. コンポーネント概要

システムは以下の 2 つの主要コンポーネントで構成されます。

1.  **vtuber-behavior-engine (AI Core)**:
    - Google ADK を使用したマルチエージェントシステム。
    - MCP Client として `vtube-stage` に接続し、ツール（発話、アニメーション等）を呼び出す。
2.  **vtube-stage (Electron App/MCP Server/Renderer)**:
    - Electron デスクトップアプリケーション（1920x1080）。
    - MCP Server (HTTP/SSE) を内蔵し、AI からのツール呼び出しを `http://localhost:8080/sse` で受理。
    - React + Three.js + @pixiv/three-vrm による 3D 描画。
    - VoiceVox 等の TTS エンジンと連携した音声再生。
    - コマンドのキューイングと完了同期 (`speakEnd` 等) を管理。

### 2.2. コンポーネントの責任範囲

| コンポーネント             | 責任                                                                | 主要技術                                 |
| :------------------------- | :------------------------------------------------------------------ | :--------------------------------------- |
| **vtuber-behavior-engine** | シナリオ制御、対話生成、ツール選択、感情決定                        | Python, Google ADK, MCP Client           |
| **vtube-stage**            | MCP サーバー、VRM 描画、TTS 再生、リップシンク、Markdown 表示、GUI | TypeScript, Electron, React, Three.js    |

## 3. 動作原理

1.  **AI の思考**: `vtuber-behavior-engine` 内のエージェントが「何を話すか」「どんな表情をするか」を決定し、MCP ツールを呼び出す。
2.  **MCP 通信**: AI は HTTP/SSE 経由で `vtube-stage` の MCP サーバー（`http://localhost:8080/sse`）にツール呼び出しを送信。
3.  **演出の実行**: `vtube-stage` がコマンドを解析し、VRM モデルのアニメーションを開始したり、TTS で音声を再生したりする。
4.  **完了通知**: 発話などが終了すると、`vtube-stage` は MCP レスポンスとして完了を AI へ返し、AI は次の行動へ移る。

## 4. アーキテクチャ図

```mermaid
graph LR
  subgraph AI_Backend[AI Backend]
    VBE[vtuber-behavior-engine\n(ADK Agents + MCP Client)]
  end

  subgraph Electron_App[Electron Desktop App]
    VS[vtube-stage\n(MCP Server + React + Three.js)\nGUI Window: 1920x1080]
  end

  subgraph External_Services[External Services]
    VV[VoiceVox\n(TTS Service)]
    OBS[OBS Studio\n(Capture)]
  end

  VBE -- "MCP (HTTP/SSE)\nhttp://localhost:8080/sse" --> VS
  VS -- HTTP --> VV
  VS -- Window Capture --> OBS
```
