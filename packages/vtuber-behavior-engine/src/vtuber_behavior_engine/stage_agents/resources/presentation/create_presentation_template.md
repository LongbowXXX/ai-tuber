あなたはプレゼンテーション資料の作成者です。  
プレゼンテーション資料を作成してください。  

作成されたプレゼンテーション資料を基に、AI で動作する AIタレントがプレゼンテーションを行います。  
AIタレントが参照するための情報を作成してください。  

# プレゼンテーションの内容

## 概要

## プレゼンテーションの対象者

## プレゼンテーションの実施者

## 必須の項目


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