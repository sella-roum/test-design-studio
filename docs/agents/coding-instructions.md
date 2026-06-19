# AIエージェント向けコーディング指示

この文書は、AIエージェントが Test Design Studio を実装する際に守るべきルールを定義する。

`docs/design.md` は親設計書であり、長期構想を含む。実装時は現在対応する詳細タスク、対象領域の仕様書、実装計画を正とし、親設計書を直接すべて実装しない。

## 最重要ルール

1. 親設計書をそのまま全部実装しない。
2. 各タスクの `Scope` に書かれているものだけを実装する。
3. `Non-goals` に書かれているものは実装しない。
4. 1PRでは1つの責務だけを完了させる。
5. 判断に迷った場合は勝手に実装を広げず、コード内TODOではなく、該当タスク文書または設計メモに未確定事項として記録する。

コード内TODOは、実装直後に解消予定の局所的な作業メモに限る。仕様判断、スコープ判断、Phase判断をコード内TODOとして残してはいけない。

## 参照優先度

実装判断に迷った場合は、次の順で確認する。

```text
1. AGENTS.md
2. docs/agents/coding-instructions.md
3. 現在対応する docs/plans/tasks/*.md の Scope / Non-goals / Acceptance criteria
4. docs/plans/task-breakdown.md
5. docs/plans/implementation-plan.md
6. 対象領域の docs/specs/*.md
7. docs/design.md
```

矛盾した場合は、原則として **現在対応する詳細タスク > 対象領域の仕様書 > 親設計書** の順で優先する。

## 実装前チェック

実装前に必ず以下を確認する。

```text
1. AGENTS.md
2. docs/agents/coding-instructions.md
3. docs/plans/tasks/*.md の対象タスク
4. docs/plans/task-breakdown.md の対象Task ID
5. docs/plans/implementation-plan.md の該当Phase
6. 対象領域の docs/specs/*.md
7. 必要な場合のみ docs/design.md の背景・長期構想
```

## ドメイン実装ルール

- TypeScriptの型を明示する。
- ドメインIDは原則 `string` で扱う。
- 日時はISO 8601文字列で保存する。
- Project配下のデータは原則 `projectId` を持つ。
- Projectを含む永続化モデルでは、削除・非推奨・履歴保持の扱いを仕様書と揃える。
- TraceLinkには `linkType` を持たせる。
- ChangeRecordには変更対象、変更種別、変更前、変更後、理由、確度を持たせる。

## Dexie / Repositoryルール

- DexieのschemaVersionは定数で管理する。
- UIコンポーネントからDexieを直接操作しない。
- 保存・取得・更新・削除はRepository層に集約する。
- Repositoryを追加した場合はテストを追加する。
- よく使う検索条件にはindexを貼るが、初期段階で過剰なcompound indexを増やしすぎない。

## UI実装ルール

- MVPではFeature Workspace中心にする。
- 管理画面を細かく分けすぎない。
- 入力項目を必須化しすぎない。
- 空状態と次のアクションを表示する。
- フォームを作る場合は、原則として保存処理まで実装する。

## Export / Importルール

- JSON exportには `schemaVersion`、`appVersion`、`exportedAt`、`exportType` を含める。
- 初期Project Importは新規Projectとして取り込む。
- 既存Projectへの上書き、差分merge、クラウド同期は後続対応にする。
- Chrome拡張候補はProject backupとは別の `UiCaptureBundle` として扱う。
- `DomCaptureBundle` は旧称として扱い、新規実装では `UiCaptureBundle` に寄せる。
- Markdown exportは、まず人間がレビューしやすい構成を優先する。

## Chrome拡張ルール

- 対象ページを破壊的に変更しない。
- DOMやAccessibility Treeから業務ルールや仕様意図を断定しない。
- Chrome拡張は入力補助として扱う。
- 初期実装ではElement Pickerによる1要素取り込みを優先する。
- 拡張由来の候補は、ユーザーが確認・編集してからUiNodeに反映する。
- DOM Capture と Accessibility Tree Capture を混同しない。
- Accessibility Tree の role、accessible name、state は `UiNode` 候補の補助情報であり、仕様の正本ではない。
- `chrome.debugger` permission を使う実装は、該当タスクで明示された場合のみ行う。
- AX取得失敗時もDOM Captureで最低限動作するようにする。
- Playwright `getByRole()` に使えそうな情報は `locatorHint` として保存してよいが、自動確定しない。

## 禁止事項

該当タスクで明示されていない限り、以下は実装しない。

- AI API呼び出し
- Playwrightテストの完全自動生成
- クラウド同期
- 認証機能
- 外部SaaS連携
- DOM全体スキャン
- DOM差分の完全自動判定
- Accessibility Treeからの仕様自動確定
- Accessibility Treeからのテストケース自動生成
- `chrome.debugger` permissionを使うAX取得
- 過剰な状態管理ライブラリ導入

## PR本文テンプレート

```md
## Summary
- 何を実装したか

## Task
- Task ID:
- Task document:

## Scope
- 今回の対象範囲

## Non-goals
- 今回あえて実装していないもの

## Testing
- 実行したチェック

## Notes
- 設計判断や次PRへの申し送り
```

## レビュー観点

- Scope外の実装が混ざっていないか。
- Non-goalsに反していないか。
- 型と保存構造が後続Phaseに耐えるか。
- UIだけで保存されない機能になっていないか。
- Repositoryテストがあるか。
- Export / ImportのschemaVersionを壊していないか。
- Chrome拡張が対象ページを破壊していないか。
- Accessibility Tree由来の情報を仕様正本として扱っていないか。
