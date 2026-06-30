## 目的

VScode拡張機能を実装する

## 要件定義

`docs\requirements.md`

### サンプルデータ

`timestamp.txt`

## コーディングルール

JSDocを日本語で書く

## 機能追加時に編集するファイル

| ファイル               | 内容                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `src/extension.ts`     | 実装本体                                                          |
| `package.json`         | バージョン番号・`contributes.configuration`（設定項目の追加時）   |
| `CHANGELOG.md`         | リリースエントリの追加（`[Unreleased]` の下に新バージョンを追記） |
| `README.md`            | セットアップ手順・機能説明の更新                                  |
| `docs/requirements.md` | 要件定義の更新                                                    |
