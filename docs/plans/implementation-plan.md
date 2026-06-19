# Test Design Studio 実装計画

この文書は、`docs/design.md` を親設計書として扱い、実装フェーズを固定するための概要計画である。詳細なPR単位のタスクは `docs/plans/task-breakdown.md` と `docs/plans/tasks/*.md` を正とする。

## 基本方針

Test Design Studio は、仕様把握、UI構造、データ条件、業務ルール、テスト観点、テストケース、変更履歴、トレーサビリティを一体で扱うローカルファーストなテスト設計ワークスペースとして実装する。

ただし、親設計書の全構想を一度に実装しない。設計は長期視点で維持し、実装はAIエージェントが1PRずつ完了できる粒度に分割する。

## 実装原則

- 1PRでは1つの責務だけを完了させる。
- Scope外の将来機能を先回りして実装しない。
- 保存対象は後続のExport、Import、TraceLink、ChangeRecordと接続できる前提にする。
- Chrome拡張は仕様生成エンジンではなく、対象アプリの現物UIから設計素材を取り込む入力補助として扱う。
- AI生成とPlaywright生成は、構造化データが安定してから接続する。

## フェーズ

| Phase | 目的 | 主な成果物 |
|---|---|---|
| 0 | 実装準備 | 実装計画、タスク分解、AI指示 |
| 1 | アプリ基盤 | Vite、React、TypeScript、品質ゲート、Dexie初期化 |
| 2 | ドメイン・保存層 | ProjectからChangeRecordまでの型、Repository、DB schema |
| 3 | Web編集フロー | Project、Feature、Screen、UiNode、Data、Rule、Viewpoint、Caseの手動編集 |
| 4 | Export / Import | Markdown、JSON、CSV、schemaVersion、復元 |
| 5 | Chrome拡張基盤 | Manifest V3、Side Panel、Content Script通信 |
| 6 | Element Picker | 対象DOM要素をUiNode候補として取り込む |
| 7 | 変更管理・影響追跡 | ChangeRecord、TraceLink、影響候補表示 |
| 8 | 技法ワークベンチ | 同値分割、境界値、状態遷移、デシジョンテーブル |
| 9 | AI / Playwright連携 | AI context export、観点レビュー、Playwright draft export |

## 優先順位

P0はPhase 0〜4とする。ここまででWebアプリ単体で1機能分の仕様把握、観点作成、ケース作成、出力ができる状態を作る。

P1はPhase 5〜7とする。Chrome拡張で実画面からUI候補を取り込み、変更履歴と影響追跡に接続する。

P2はPhase 8〜9とする。構造化済みの仕様データを使って、技法ベースの観点生成、AIレビュー、Playwright実装支援に進む。

## 実装時の注意

- 実装対象は `docs/plans/task-breakdown.md` の該当タスクに従う。
- 詳細タスクは `docs/plans/tasks/*.md` を確認する。
- タスク外の実装が必要になった場合は、先にタスク文書を更新する。
- Chrome拡張は、Webアプリ側の保存モデルが安定してから進める。
