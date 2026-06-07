# 仕様書：タイムスタンプ書き込みスクリプト

## 概要

Claude Code の Stop フックから呼び出され、現在時刻をプロジェクトルートの
`timestamp.txt` に書き込む Python スクリプト。

---

## 呼び出し仕様

| 項目 | 内容 |
|---|---|
| 呼び出し元 | Claude Code Stop フック |
| タイミング | Claude が1ターンの応答を終えるたびに発火 |
| 引数 | なし（stdin に JSON が渡される） |
| 終了コード | 常に 0（エラーはサイレント） |

---

## stdin JSON（Stop イベント）

Claude Code から以下の JSON が stdin に渡される。

```json
{
  "session_id": "abc123",
  "transcript_path": "/home/user/.claude/projects/.../transcript.jsonl",
  "cwd": "C:/Users/user/myproject",
  "hook_event_name": "Stop",
  "stop_hook_active": false
}
```

スクリプトが使うフィールドは `cwd` のみ。

---

## タイムスタンプファイルの仕様

| 項目 | 内容 |
|---|---|
| 出力先 | `<cwd>/timestamp.txt` |
| 内容 | ISO 8601 ローカル時刻を1行だけ記述 |
| 例 | `2026-05-20T15:30:00` |
| 文字コード | UTF-8 |
| 書き込み方式 | 上書き（追記なし） |

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| 言語 | Python 3 |
| 依存ライブラリ | 標準ライブラリのみ（`sys`, `json`, `datetime`, `pathlib`） |
| 動作環境 | Windows（PowerShell から Claude Code を呼び出し） |

---

## ファイル構成

```
~/.claude/
├── settings.json          # Stop フック設定
└── hooks/
    └── write_timestamp.py # 本スクリプト
```

グローバル設定（`~/.claude/`）に置くことで全プロジェクト共通で動作する。

---

## 実装

### write_timestamp.py

```python
import sys
import json
from datetime import datetime
from pathlib import Path

def main():
    try:
        data = json.load(sys.stdin)
        cwd = data["cwd"]
        timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        (Path(cwd) / "timestamp.txt").write_text(timestamp, encoding="utf-8")
    except Exception:
        pass  # エラーはサイレント。VSCode側の表示が更新されないことで気付く

if __name__ == "__main__":
    main()
```

### ~/.claude/settings.json

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python \"C:/Users/<USERNAME>/.claude/hooks/write_timestamp.py\""
          }
        ]
      }
    ]
  }
}
```

`<USERNAME>` は実際のユーザー名に置き換える。
絶対パスを使うことで、どのディレクトリから Claude Code を起動しても確実に動作する。

---

## セットアップ手順

1. `~/.claude/hooks/` ディレクトリを作成する
2. `write_timestamp.py` を配置する
3. `~/.claude/settings.json` に上記の Stop フック設定を追記する
4. Claude Code を再起動する
5. 任意のプロジェクトで Claude Code を使い、Stop 後に `<プロジェクトルート>/timestamp.txt` が生成されることを確認する

---

## .gitignore 推奨設定

`timestamp.txt` はプロジェクト内に生成されるが git 管理不要なので、
各プロジェクトの `.gitignore` に追加することを推奨する。

```
timestamp.txt
```

---

## 対象外（スコープ外）

- エラー通知
- 複数ファイルへの書き込み
- ログ出力
- `transcript_path` など他フィールドの活用
