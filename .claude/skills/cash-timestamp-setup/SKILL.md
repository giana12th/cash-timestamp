---
name: cash-timestamp-setup
description: cash-timestamp VSCode拡張機能用に.vscode/settings.local.jsonをセットアップする。新しいプロジェクトで初回に一度だけ実行する。
argument-hint: なし（引数不要）
disable-model-invocation: true
allowed-tools: Read,Write(.vscode/settings.local.json),Bash(pwd -W),Bash(grep *),Edit(.vscode/settings.local.json)
---

# cash-timestamp-setup

cash-timestamp 拡張機能をこのプロジェクトで使えるようにするため、
`.vscode/settings.local.json` を設定する。

## ステップ1: 現在のディレクトリを確認

!`pwd -W`
!`ls .vscode`

を実行して現在の作業ディレクトリ（`CWD`）を取得する。
`-W` オプションにより Git Bash 形式（`/d/...`）ではなく Windows 形式（`D:/...`）のパスが返る。
以降、`CWD` はこのパスを指す。

## ステップ2: `.vscode/settings.local.json` を設定

**設定するパス：** `<CWD>/.vscode/settings.local.json`

**設定する値：**

```json
"timestampViewer.filePath": "<CWD>/timestamp.txt"
```

処理方針：

- ファイルが存在しない → `.vscode/` ディレクトリごと新規作成（`mkdir -p` 相当を Write で対応）
- ファイルが存在する → Read してから `timestampViewer.filePath` キーを追加・上書きしてマージ Write する
  - 既存の他のキーは**絶対に消さない**こと

補足: `timestamp.txt` と `.vscode/settings.local.json` はグローバル gitignoreで除外済みのため、`.gitignore` への追記は不要。

## ステップ3: 完了報告

以下のサマリを表示して終了する：

```
✅ cash-timestamp セットアップ完了

.vscode/settings.local.json
  timestampViewer.filePath: <設定したパス>

```
