# 要求一覧

## 基本機能

* **AIキャラクターによるYouTube生放送**:
    * ずんだもん、四国メタンの2キャラクターを使用
    * キャラクターの性格・言動は一般的に認識されているものに準拠
    * キャラクターボイスは公式音声（TTS）を利用
    * 音声再生時のリップシンク機能
    * 対話内容に応じたモーション
* **視聴者とのインタラクション**:
    * YouTube視聴者コメントのリアルタイム取得
    * 2キャラクターによる掛け合い会話
    * 長期記憶機能
        * 視聴者の記憶
        * 過去の会話における重要情報の記憶
* **情報表示機能**:
    * 説明用情報のリアルタイム表示 (例: 図解)
    * LLMのFunction Callingによる表示機能制御
        * Webページ表示
        * 図の表示 (Mermaid記法)
        * ドキュメント表示 (Markdown記法)
* **時事ネタ対応**:
    * News情報などを取得し、時事ネタに関するコメント生成・表示

## AI キャラクター制御・対話機能

* **LLMによる対話生成**:
    * langchainを利用
    * 3種類のLLMを用途別に利用
        * ずんだもんキャラクター専用LLM
        * 四国メタンキャラクター専用LLM
        * 調停用AI LLM
            * 対話履歴管理 (各キャラの発話、調停AIによるイベント)
            * 発話キャラクター制御
            * 新話題の提供 (視聴者発話、News情報に基づく)
* **長期記憶**:
    * LLMによる長期記憶の実現
    * 視聴者情報、重要会話履歴の記憶
* **モーション・表情制御**:
    * 対話内容に基づいたモーション・表情の自動生成・制御

## システム構成

* **アプリケーション**:
    * キャラクター表示・情報表示用アプリ
        * Unityで開発
* **LLM制御・指示用バックエンド (キャラクター挙動制御サービス)**:
    * Pythonで開発
    * LLMによる発話の生成、モーション・表情・情報表示の指示
    * キャラクター挙動制御サービスとしての機能
        * 状態管理
        * WebSocket API提供 (FastAPI利用)

## 技術要素

* **キャラクターモデル**:
    * VRoid
      HubからずんだもんVRMモデル入手 ([https://hub.vroid.com/characters/821734897565535106/models/8611519130687999893](https://hub.vroid.com/characters/821734897565535106/models/8611519130687999893))
    * 利用規約の緩いモデルを選定
    * 公式ガイドライン ([https://zunko.jp/guideline.html](https://zunko.jp/guideline.html)) 遵守
* **開発ツール**:
    * Unity, Python,
      VMagicMirror ([https://www.sato-susumu.com/entry/2023/03/25/190104](https://www.sato-susumu.com/entry/2023/03/25/190104))
* **音声合成**:
    *
  VOICEVOX ([https://voicevox.hiroshiba.jp/](https://voicevox.hiroshiba.jp/), [https://note.com/key410/n/n1bf0e797da61](https://note.com/key410/n/n1bf0e797da61))
    * VOICEVOXエンジンAPI利用
* **ドキュメント変換**:
    *
  PDF等ドキュメントのMarkdown変換 ([https://github.com/microsoft/markitdown](https://github.com/microsoft/markitdown))
* **仮想オーディオ**:
    * VB
      Cable ([https://vb-audio.com/Cable/](https://vb-audio.com/Cable/), [https://www.monoists.com/entry/how-to-use-vb-cable](https://www.monoists.com/entry/how-to-use-vb-cable))
* **不適切入力ガード**:
    * Azure Content
      Safety ([https://learn.microsoft.com/ja-jp/azure/ai-services/content-safety/concepts/response-codes](https://learn.microsoft.com/ja-jp/azure/ai-services/content-safety/concepts/response-codes))
    * Gemini API
      安全設定 ([https://ai.google.dev/gemini-api/docs/safety-settings?hl=ja](https://ai.google.dev/gemini-api/docs/safety-settings?hl=ja))
* **WebView**:
    * UnityWebView ([https://github.com/gree/unity-webview](https://github.com/gree/unity-webview))
    * WebGL対応 (Windows非対応)
* **プロンプト**:
    * ずんだもんプロンプト例 ([https://g.co/gemini/share/fe359c7b5177](https://g.co/gemini/share/fe359c7b5177))
* **VRM & モーション**:
    * UniVRM for Unity ([https://github.com/vrm-c/UniVRM/releases](https://github.com/vrm-c/UniVRM/releases))
    * FBXモーション利用
    * Humanoid Rig設定
    * AnimationController設定

## その他

* **キャラクター**:
    * ずんだもん [Image of ずんだもんのイメージ]
    * 四国めたん [Image of 四国めたんのイメージ]

---

**補足事項**

* **LLM制御・指示用バックエンド (キャラクター挙動制御サービス) の役割**:
  LLMによる対話生成、モーション・表情・情報表示の指示を行うバックエンドサービスが、キャラクターの挙動を制御するサービスとしての役割も兼ねることを明確にしました。状態管理、WebSocket
  API提供などもこのバックエンドサービスに含まれます。
* **調停用AIの役割**:
  2キャラクターの会話を調停し、会話がスムーズに進むように制御するAIの導入が検討されています。具体的には、会話履歴を監視し、次に発言するキャラクターを決定したり、新しい話題を提供したりする役割を担います。
* **長期記憶の実装**: 視聴者情報や過去の重要な会話を記憶することで、よりパーソナライズされた、継続性のある会話体験を目指します。
* **表示機能の活用**: LLMのFunction Callingを活用することで、会話の内容に合わせてWebページ、図解、ドキュメントなどを表示し、視聴者への情報伝達を効果的に行うことが期待されます。
* **安全性への配慮**: 不適切な入力を防ぐための対策として、Azure Content SafetyやGemini APIの安全設定の利用が検討されています。
