# cash-timestamp

外部アプリが書き込むタイムスタンプファイルを監視し、経過時間を VSCode ステータスバーに常時表示する拡張機能。

Claude Code と組み合わせると、**Claude が返答を終えてから次の指示を入力するまでの経過時間**をステータスバーで見える化できる。

## 構成

このリポジトリは 2 つの部品で構成される。

| 部品 | 場所 | 役割 |
|---|---|---|
| VSCode 拡張機能 | `src/` | `timestamp.txt` を監視し、経過時間をステータスバーに表示（読み取り専用） |
| Claude Code 連携 | `.claude/` | Claude の応答完了時に `timestamp.txt` を書き込むフック・セットアップスキル |

拡張機能単体でも、外部アプリが `timestamp.txt` を書き込む用途で使える。Claude Code 連携は「書き込み側」を Claude Code に担わせるためのサンプル設定。

## 前提環境

**Windows + Git Bash** で Claude Code を動かす構成を前提としている。

- VSCode 拡張機能は Windows 専用（他 OS の動作は保証しない）
- Claude Code のシェルは Git Bash を想定。セットアップスキルは Windows 形式のパスを得るために `pwd -W`（Git Bash / MSYS 専用のフラグ）を使う
- フックの実行には Python 3 が必要（`python` コマンドで起動できること）

他 OS で使う場合は、スキルの `pwd -W` を `pwd` に、`python` を `python3` に読み替える必要がある。

## 表示例

| 状態 | 表示 |
|---|---|
| 正常（経過時間表示中） | `⏱ 02:30:15` |
| ファイルなし／読み取りエラー | `⏱ --:--:--` |

## セットアップ

1. `.vscode/settings.local.json` を作成し、タイムスタンプファイルのパスを設定する

```json
{
  "timestampViewer.filePath": "C:/Users/user/timestamp.txt"
}
```

`.vscode/settings.local.json` は git 管理対象外（`.gitignore` 済み）のため、フルパスを含む設定をリポジトリに混入させずに管理できる。

`.vscode/settings.json` やユーザー設定への記述も引き続き有効。`settings.local.json` が存在する場合はそちらが優先される。

## Claude Code 連携のセットアップ

Claude Code の応答完了などをトリガーに `timestamp.txt` を書き込むには、`.claude/` 以下のサンプル設定を使う。このリポジトリの `.claude/` は**プロジェクトローカル設置**を前提にした構成で、`settings.json` のフックパスに `$CLAUDE_PROJECT_DIR`（Claude Code がプロジェクトルートに展開する変数）を使っているため、フォルダごとコピーすればそのまま動く。

### 1. `.claude/` を対象プロジェクトへコピー

このリポジトリの `.claude/`（`hooks/`・`skills/`・`settings.json`）を、拡張機能を使いたいプロジェクトのルートにコピーする。フックの実行には Python 3 が必要（`python` コマンドで起動できること）。標準ライブラリのみで動くため `pip install` は不要。

`.claude/settings.json` の中身は以下のようになっている。

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "python \"$CLAUDE_PROJECT_DIR/.claude/hooks/write_timestamp.py\"" }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "python \"$CLAUDE_PROJECT_DIR/.claude/hooks/write_timestamp.py\"" }
        ]
      }
    ]
  }
}
```

- **Stop**: Claude が 1 ターンの応答を終えた瞬間に発火する（＝ここから待機時間が始まる）
- **PermissionRequest**: Claude が権限確認で入力待ちに入った瞬間にも発火し、タイマーが更新される

どちらも「Claude が待ち始めた」タイミングなので、経過時間の起点として `timestamp.txt` を書き込む。フックは書き込み先プロジェクトを stdin の `cwd` から自動判別する。

> **注意:** フックコマンド内では `~` は展開されない（クォート内では bash でも展開されない）。パスには `$CLAUDE_PROJECT_DIR` か絶対パスを使うこと。

コピー後は Claude Code を再起動する。

### 2. 各プロジェクトで初期設定

拡張機能を使いたいプロジェクトで Claude Code から次を実行する。

```
/cash-timestamp-setup
```

`.vscode/settings.local.json` に `timestampViewer.filePath`（そのプロジェクトの `timestamp.txt` への絶対パス）が自動生成される。`timestamp.txt` と `.vscode/settings.local.json` はグローバル gitignore で除外される前提のため、`.gitignore` の編集は不要。

### グローバル gitignore の設定（初回のみ）

セットアップスキルはプロジェクトの `.gitignore` を編集しない。代わりに、`timestamp.txt` と `.vscode/settings.local.json` を**グローバル gitignore** で除外しておくことで、どのプロジェクトでもこれらが誤ってコミットされないようにする。この設定は 1 台につき初回に一度だけ行えばよい。

git は `core.excludesfile` が未設定の場合、`~/.config/git/ignore`（Windows では `C:/Users/<ユーザー名>/.config/git/ignore`）をグローバル無視ファイルとして読む。このファイルに以下を追記する（`git config` の実行は不要）。

```
timestamp.txt
.vscode/settings.local.json
```

### 全プロジェクトで有効にする場合（グローバル設置）

プロジェクトごとにコピーせず、すべてのプロジェクトで一括して有効にしたい場合は、`.claude/` の各ファイルをグローバル設定（`~/.claude/`）に置く。

- `hooks/write_timestamp.py` → `~/.claude/hooks/`
- `skills/cash-timestamp-setup/` → `~/.claude/skills/`
- フック設定 → `~/.claude/settings.json`

ただしグローバル設定では `$CLAUDE_PROJECT_DIR` ではなく、スクリプトを置いた**絶対パス**を書く（前述のとおり `~` は展開されない）。

```json
{ "type": "command", "command": "python \"C:/Users/<ユーザー名>/.claude/hooks/write_timestamp.py\"" }
```

## タイムスタンプファイルの仕様

- UTF-8 テキストファイル（`.txt`）
- ISO 8601 ローカル時刻を1行だけ記述

```
2026-05-20T15:30:00
```

外部アプリがこのファイルを書き換えると、表示が自動でリセットされる。

## 動作仕様

- 1秒ごとに経過時間を更新
- ファイル更新を `fs.watch` で自動検知（デバウンス 200ms）
- ファイルが存在しない／読み取りエラー時は `⏱ --:--:--` を表示
- ファイルが復旧した際は自動で正常表示に戻る
