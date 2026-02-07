<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# システム概要 (System Overview)

## 1. はじめに

### 1.1. 目的

本プロジェクトは、Google ADK（マルチエージェントフレームワーク）と MCP（Model Context Protocol）を統合し、AI による対話・行動生成をリアルタイムに VRM キャラクターの表現（発話、表情、アニメーション、情報表示）へ変換する V-Tuber 配信システムを構築することを目的としています。

### 1.2. スコープ

- **AI コア**: ニュース読み上げや対話などのシナリオに基づく行動生成。
- **Electron デスクトップアプリ (VTube Stage)**: MCP Server として AI からのツール呼び出しを受け、VRM モデルの描画、音声合成 (TTS)、Markdown テキストの表示を実行。
- **外部連携**: OBS Studio 等の配信ソフトへの映像出力（ウィンドウキャプチャ前提）。

## 2. システム構成

### 2.1. コンポーネント概要

システムは以下の 2 つの主要コンポーネントで構成されます。

1.  **vtuber-behavior-engine (AI Core)**:
    - Google ADK を使用したマルチエージェントシステム。
    - MCP Client として `vtube-stage` に stdio で接続し、ツール（発話、アニメーション等）を呼び出す。
2.  **vtube-stage (Electron Desktop App)**:
    - **Main Process**: MCP Server (stdio) を提供し、AI からのツール呼び出しを受理。Electron IPC 経由で Renderer プロセスにコマンドを送信。コマンドのキューイングと完了同期 (`speakEnd` 等) を管理。
    - **Renderer Process**: React + Three.js + @pixiv/three-vrm による 3D 描画。VoiceVox 等の TTS エンジンと連携した音声再生。IPC で受信したコマンドに基づき、キャラクターを制御。
    - デフォルト解像度: 1920x1080

### 2.2. コンポーネントの責任範囲

| コンポーネント                    | 責任                                                      | 主要技術                                    |
| :-------------------------------- | :-------------------------------------------------------- | :------------------------------------------ |
| **vtuber-behavior-engine**        | シナリオ制御、対話生成、ツール選択、感情決定              | Python, Google ADK, MCP Client              |
| **vtube-stage (Main Process)**    | MCP Server、ツール定義の公開、IPC 配信、完了待機          | TypeScript, Electron, @modelcontextprotocol |
| **vtube-stage (Renderer Process)** | VRM 描画、TTS 再生、リップシンク、Markdown 表示、OBS 連携 | TypeScript, React, Three.js                 |

## 3. 動作原理

1.  **AI の思考**: `vtuber-behavior-engine` 内のエージェントが「何を話すか」「どんな表情をするか」を決定し、MCP ツールを呼び出す。
2.  **MCP 通信**: `vtube-stage` の Main プロセスが stdio 経由で MCP ツール呼び出しを受信し、JSON 形式のコマンドに変換。
3.  **IPC 送信**: Main プロセスが Electron IPC 経由で Renderer プロセスにコマンドを送信。
4.  **演出の実行**: Renderer プロセスがコマンドを解析し、VRM モデルのアニメーションを開始したり、TTS で音声を再生したりする。
5.  **完了通知**: 発話などが終了すると、Renderer は IPC 経由で Main プロセスに通知し、Main プロセスは MCP 経由で AI に完了を返す。AI は次の行動へ移る。

## 4. アーキテクチャ図

```mermaid
graph LR
  subgraph AI_Backend[AI Backend]
    VBE[vtuber-behavior-engine\n(ADK Agents\nMCP Client)]
  end

  subgraph Electron_App[vtube-stage Electron App]
    direction TB
    Main[Main Process\n(MCP Server stdio)]
    Renderer[Renderer Process\n(React + Three.js)]
    Main -- Electron IPC --> Renderer
  end

  subgraph External[External Services]
    VV[VoiceVox\n(TTS Service)]
    OBS[OBS Studio\n(Capture)]
  end

  VBE -- MCP stdio --> Main
  Renderer -- HTTP --> VV
  Renderer -- Window Capture --> OBS
```
