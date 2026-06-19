# Non-goals

## Purpose

この文書は、Test Design Studio の段階実装で意図的にまだやらないことを定義する。

このプロジェクトはスコープが広いため、やることだけでなく、まだやらないことを明確にする。AIエージェントは、この文書に記載された内容を該当フェーズで実装してはいけない。

## Phase terms

この文書では、次の意味でフェーズ名を使う。

- P0: Web Design MVP。Webアプリ単体で1機能分の設計データを作り、JSON/Markdownで出力できる状態。
- P1: Capture & Trace MVP。Chrome拡張、UiCaptureCandidate、ChangeRecord、TraceLink UI、影響候補表示を扱う状態。
- P2: Assistive Design MVP。技法ワークベンチ、AI context export、Playwright draft exportを扱う状態。

単に「初期実装」と書かれている場合は、原則としてP0を指す。

## Global non-goals

P0では、次を実装しない。

- クラウド同期
- 認証
- 複数ユーザー同時編集
- 権限管理
- 課金
- SaaS運用基盤
- 外部チーム共有機能
- モバイルアプリ

## AI non-goals

P0/P1では、AI機能を実装しない。

やらないこと:

- AIによる仕様書の自動生成
- AIによるテスト観点の大量生成
- AIによるテストケースの自動確定
- AIによるPlaywrightコード生成
- AIによる変更影響の自動確定
- 外部LLM API連携
- API key管理

P2でAI補助を入れる場合も、構造化済みデータを入力として、候補生成・レビュー補助・exportに限定する。

## Playwright non-goals

P0/P1では、Playwrightコード生成や実行を行わない。

やらないこと:

- Playwright specの自動生成
- Playwright実行
- テスト結果収集
- trace viewer連携
- スクリーンショット比較
- Playwright E2EのCI実行
- 自己修復テスト

P0/P1では、`selectorHint`、`TestStep.targetUiNodeId`、`automationSuitability`、`automationReason` を保存し、将来の自動化に備えるまでとする。

通常のlint / typecheck / unit test のCIはPhase 1の品質ゲートとして実装してよい。ここで禁止しているCI実行は、Playwright E2Eの実行・結果収集・trace保存を指す。

## Chrome extension non-goals

P1のChrome拡張では、次を行わない。

- DOMやAccessibility Treeから仕様を完全自動生成する。
- DOMやAccessibility Treeからテストケースを自動生成する。
- Accessibility Treeのrole/name/stateを、ユーザー確認なしに `UiNode` 正本へ採用する。
- 対象アプリのフォームを自動入力する。
- 対象アプリの保存・更新・削除操作を実行する。
- 対象アプリに永続的なDOM変更を加える。
- Webアプリ本体をiframeで対象ページに埋め込む。
- 複数タブを自動巡回する。
- ログインや権限を突破する。
- 画面全体のDOMを永続保存する。
- 画面全体のAX treeを永続保存する。
- input valueや認証情報を保存する。
- `chrome.debugger` permissionを標準必須機能にする。

Chrome拡張は、あくまで入力補助である。

## Accessibility Tree non-goals

P1でAccessibility Tree解析を導入する場合も、次を行わない。

- AX treeから仕様意図を自動確定する。
- AX treeから業務ルールを推定する。
- AX treeから期待結果を推定する。
- AX treeからテストケースを自動生成する。
- AX treeのrole/name/stateを仕様の正本として無条件に採用する。
- AX treeの不完全さをもって対象アプリの仕様欠陥と断定する。
- ページ全体のAX treeを永続スナップショットとして保存する。
- `chrome.debugger` permissionを通常MVPの必須権限にする。
- Playwright `ariaSnapshot()` 取り込みをP1の必須実装にする。

Accessibility Tree解析は、ユーザー視点のUI候補を補助するための情報源であり、仕様やテスト設計を自動確定する根拠ではない。

## Integration non-goals

P0/P1では、外部サービス連携を行わない。

やらないこと:

- Figma API連携
- Notion API連携
- Jira API連携
- GitHub Issue/PR連携
- Google Drive連携
- Slack連携
- TestRail、Qase、Zephyrなどのテスト管理ツール連携

外部連携は、ローカルデータモデルとexport/importが安定してから検討する。

## Data non-goals

P0/P1では、次を行わない。

- サーバーDB保存
- リモートバックアップ
- 暗号化ストレージ
- 差分同期
- 競合解決
- 複数端末間の自動同期

ローカルデータの持ち出しはJSON export/importで対応する。

## UI non-goals

P0では、次を優先しない。

- 高度なグラフ可視化
- ドラッグ&ドロップ中心の複雑UI
- 完全なダッシュボード分析
- リアルタイム共同編集UI
- モバイル最適化
- 高度なテーマカスタマイズ
- `/settings` 画面

まずは、入力・保存・出力・追跡が確実にできるUIを優先する。

## Test design non-goals

P0では、次を行わない。

- すべてのテスト技法の完全自動化
- 組み合わせテストの自動最適化
- リスクベーステストの自動判定
- 網羅率の完全保証
- 未確認仕様の自動解決
- DecisionTableの本格編集UI
- StateTransitionからの観点自動生成

Test Design Workbenchは、候補生成とレビュー補助としてP2で段階的に実装する。

## Change management non-goals

P0では、次を保証しない。

- 変更影響の完全自動検出
- DOM差分の完全一致比較
- Accessibility Tree差分の完全一致比較
- Git履歴との自動同期
- 外部PRやIssueとの紐づけ
- 法的監査ログとしての厳密性

P0では保存モデルと基本リンクを整え、P1で変更履歴UIと影響候補表示を実装する。変更履歴は、実務上の追跡とテスト設計メンテナンスを目的とする。

## Why this matters

このリポジトリでは、親設計書に長期構想が多く含まれる。そのため、AIエージェントが親設計書だけを読んで実装すると、スコープが広がりやすい。

P0では、次を優先する。

1. ドメインモデルを安定させる。
2. IndexedDBに正しく保存する。
3. Webアプリで1機能分の設計を作れるようにする。
4. JSON / Markdownで外に出せるようにする。

P1では、Chrome拡張、変更管理、TraceLink UI、影響候補表示を追加する。

P2では、技法ワークベンチ、AI context export、Playwright draft exportへ進む。

上記が安定するまで、非対象機能を先取りしない。
