# Change Log

All notable changes to the "cash-timestamp" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.2.0] - 2026-07-19

### Added

- Claude Code 連携のサンプル設定（`.claude/`）を追加
  - `.claude/hooks/write_timestamp.py`（Stop / PermissionRequest フックから `timestamp.txt` を書き込む）
  - `.claude/skills/cash-timestamp-setup/SKILL.md`（`.vscode/settings.local.json` を生成するセットアップスキル）
  - `.claude/settings.json`（フック登録のサンプル設定）
- GitHub Actions によるリリースワークフロー（`.github/workflows/release.yml`）を追加。`v*.*.*` タグ push で VSIX をビルドし GitHub Releases に公開

### Changed

- README に Claude Code 連携のセットアップ手順とグローバル gitignore 設定手順を追記
- CLAUDE.md を「VSCode 拡張機能側」「Claude Code 連携側」の 2 部構成に整理
- `.vscodeignore` に `.claude/` `.github/` `blog/` `docs/` などを追加し、VSIX に同梱しないよう変更（README に注記も追加）
- `vsc-extension-quickstart.md` を削除

## [1.1.0] - 2026-06-30

### Added

- `.vscode/settings.local.json`（`.vscode/` ディレクトリ内）からの設定読み込みに対応
  - `.vscode/settings.local.json` の値が `.vscode/settings.json` より優先される
  - フルパスなどローカル専用の設定を git 管理外に置ける
  - `.vscode/settings.local.json` の変更をファイル監視で自動検知・反映
- `.vscode/settings.local.json` を `.gitignore` に追加

### Changed

- ドキュメント内のパス例をフォワードスラッシュ表記に統一（`C:\\Users\\...` → `C:/Users/...`）

## [1.0.0] - 2026-05-25

### Added

- タイムスタンプファイル（ISO 8601 ローカル時刻）を読み込み、現在時刻との経過時間をステータスバーに常時表示する機能
- 経過時間の表示フォーマット：`⏱ HH:MM:SS`（1秒ごとに更新）
- `fs.watch` によるファイル変更の自動検知・表示リセット（デバウンス処理済み）
- ファイルが存在しない／読み取りエラー時は `⏱ --:--:--` を表示し、復旧後に自動で正常表示へ切り替え
- `timestampViewer.filePath` 設定でファイルパスをユーザー設定・ワークスペース設定の両方から指定可能

[Unreleased]: https://github.com/giana12th/cash-timestamp/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/giana12th/cash-timestamp/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/giana12th/cash-timestamp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/giana12th/cash-timestamp/releases/tag/v1.0.0
