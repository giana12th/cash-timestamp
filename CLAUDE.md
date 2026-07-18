## 目的

`timestamp.txt` の経過時間を VSCode ステータスバーに表示する仕組み。リポジトリは 2 レイヤー構成:

- **VSCode 拡張機能（`src/`）** — `timestamp.txt` を監視して経過時間を表示（読み取り専用）
- **Claude Code 連携（`.claude/`）** — Claude の応答完了・権限待ち時に `timestamp.txt` を書き込むサンプル設定

「書き込み側」と「表示側」は `timestamp.txt` という契約だけで疎結合になっている。

## 要件定義

`docs\requirements.md`

### サンプルデータ

`timestamp.txt`

## コーディングルール

JSDocを日本語で書く

## 機能追加時に編集するファイル

### VSCode 拡張機能側

| ファイル               | 内容                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `src/extension.ts`     | 実装本体                                                          |
| `package.json`         | バージョン番号・`contributes.configuration`（設定項目の追加時）   |
| `CHANGELOG.md`         | リリースエントリの追加（`[Unreleased]` の下に新バージョンを追記） |
| `README.md`            | セットアップ手順・機能説明の更新                                  |
| `docs/requirements.md` | 要件定義の更新                                                    |

### Claude Code 連携側（`.claude/`：グローバル設定へコピーして使うサンプル）

| ファイル                                       | 内容                                                            |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `.claude/hooks/write_timestamp.py`             | Stop / PermissionRequest フックから呼ばれ、`cwd` に `timestamp.txt` を書く |
| `.claude/settings.json`                        | Stop / PermissionRequest フックの登録サンプル（パスは `~/.claude/` 表記） |
| `.claude/skills/cash-timestamp-setup/SKILL.md` | 新規プロジェクトで `.vscode/settings.local.json` を生成するスキル |
