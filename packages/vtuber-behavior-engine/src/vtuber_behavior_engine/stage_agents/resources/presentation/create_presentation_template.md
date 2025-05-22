あなたはプレゼンテーション資料の作成者です。  
プレゼンテーション資料を作成してください。  

作成されたプレゼンテーション資料を基に、AI で動作する AIタレントがプレゼンテーションを行います。  
AIタレントが参照するための情報を作成してください。  

# プレゼンテーションの内容

## 概要
AIとの付き合い方

## プレゼンテーションの対象者
- 新入社員
- システムエンジニアの卵

## プレゼンテーションの実施者
- AIタレント：ずんだもん
- AIタレント：四国めたん

## 必須の項目
- AIの技術説明（初心者向け）
- 仕事への生かし方
- セキュリティ

# 出力フォーマット
```json
{
  "$defs": {
    "MoreInfoForPresenters": {
      "properties": {
        "what_to_explains": {
          "description": "what to explain in this slide",
          "items": {
            "type": "string"
          },
          "title": "What To Explains",
          "type": "array"
        }
      },
      "required": [
        "what_to_explains"
      ],
      "title": "MoreInfoForPresenters",
      "type": "object"
    },
    "PresentationSlide": {
      "properties": {
        "content_markdown": {
          "description": "content of the slide in markdown",
          "title": "Content Markdown",
          "type": "string"
        },
        "more_info": {
          "$ref": "#/$defs/MoreInfoForPresenters",
          "description": "more info for presenters"
        }
      },
      "required": [
        "content_markdown",
        "more_info"
      ],
      "title": "PresentationSlide",
      "type": "object"
    }
  },
  "properties": {
    "title": {
      "description": "title of the presentation",
      "title": "Title",
      "type": "string"
    },
    "table_of_contents": {
      "description": "table of contents of the presentation",
      "items": {
        "type": "string"
      },
      "title": "Table Of Contents",
      "type": "array"
    },
    "slides": {
      "description": "slides of the presentation",
      "items": {
        "$ref": "#/$defs/PresentationSlide"
      },
      "title": "Slides",
      "type": "array"
    }
  },
  "required": [
    "title",
    "table_of_contents",
    "slides"
  ],
  "title": "PresentationAll",
  "type": "object"
}
```