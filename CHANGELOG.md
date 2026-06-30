# Change Log

All notable changes to the "cash-timestamp" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

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

[Unreleased]: https://github.com/giana12th/cash-timestamp/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/giana12th/cash-timestamp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/giana12th/cash-timestamp/releases/tag/v1.0.0
