# AIエージェント向けコーディング指示

この文書は、AIエージェントが Test Design Studio を実装する際に守るべきルールを定義する。

`docs/design.md` は親設計書であり、長期構想を含む。実装時は `docs/plans/implementation-plan.md`、`docs/plans/task-breakdown.md`、`docs/plans/tasks/*.md` の該当タスクを正とする。

## 最重要ルール

1. 親設計書をそのまま全部実装しない。
2. 各タスクの `Scope` に書かれているものだけを実装する。
3. `Non-goals` に書かれているものは実装しない。
4. 1PRでは1つの責務だけを完了させる。
5. 判断に迷った場合は勝手に実装を広げず、TODOまたは設計メモとして残す。

## 実装前チェック

実装前に必ず以下を確認する。

```text
1. docs/design.md の関連箇所
2. docs/plans/implementation-plan.md の該当Phase
3. docs/plans/task-breakdown.md の対象PR
4. docs/plans/tasks/*.md の詳細タスク
5. この coding-instructions.md
```

## ドメイン実装ルール

- TypeScriptの型を明示する。
- ドメインIDは原則 `string` で扱う。
- 日時はISO 8601文字列で保存する。
- Project配下のデータは原則 `projectId` を持つ。
- 必要なモデルでは `active / deprecated / removed` を区別する。
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

- JSON exportには `schemaVersion`、`appVersion`、`exportedAt` を含める。
- 初期Importは新規Projectとして取り込む。
- 既存Projectへの上書き、差分merge、クラウド同期は後続対応にする。
- Markdown exportは、まず人間がレビューしやすい構成を優先する。

## Chrome拡張ルール

- 対象ページを破壊的に変更しない。
- DOMから業務ルールや仕様意図を断定しない。
- Chrome拡張は入力補助として扱う。
- 初期実装ではElement Pickerによる1要素取り込みを優先する。

## 禁止事項

該当タスクで明示されていない限り、以下は実装しない。

- AI API呼び出し
- Playwrightテストの完全自動生成
- クラウド同期
- 認証機能
- 外部SaaS連携
- DOM全体スキャン
- DOM差分の完全自動判定
- 過剰な状態管理ライブラリ導入

## PR本文テンプレート

```md
## Summary
- 何を実装したか

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
