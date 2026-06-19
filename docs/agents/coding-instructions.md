# AIエージェント向けコーディング指示

この文書は、AIエージェントが Test Design Studio を実装する際に守るべきルールを定義する。

`docs/design.md` は親設計書であり、プロダクトの全体構想を示す。実装時は、必ず `docs/plans/implementation-plan.md` と `docs/plans/task-breakdown.md` を確認し、指定されたタスクの範囲だけを実装する。

## 1. 最重要ルール

### 1.1 親設計書をそのまま全部実装しない

`docs/design.md` には長期構想が含まれる。1つのPRで親設計書の全体を実装しようとしてはいけない。

実装対象は、必ず `docs/plans/task-breakdown.md` の該当タスクに限定する。

### 1.2 Scope外の実装をしない

各タスクには `Scope` と `Non-goals` がある。

- `Scope` に書かれているものだけを実装する。
- `Non-goals` に書かれているものは実装しない。
- 必要に見えても、将来フェーズの機能を先回りしない。

悪い例:

```text
Projectモデルの実装タスクなのに、Feature UIやExport機能まで追加する。
```

良い例:

```text
Project型、Dexie schema、Repository、Repositoryテストだけを追加する。
```

### 1.3 1PR = 1責務

1つのPRでは、1つの完成単位に集中する。

- 基盤PRでは基盤だけを作る。
- Repository PRでは保存層だけを作る。
- UI PRでは対象UIだけを作る。
- Export PRではExportだけを作る。
- Chrome拡張PRでは拡張機能だけを作る。

複数フェーズにまたがる変更を混ぜない。

## 2. 実装前チェック

実装前に必ず以下を確認する。

```text
1. docs/design.md の関連箇所
2. docs/plans/implementation-plan.md の該当フェーズ
3. docs/plans/task-breakdown.md の該当PRタスク
4. この coding-instructions.md
```

確認後、以下を明確にする。

```text
- 今回実装するもの
- 今回実装しないもの
- 主に変更するファイル
- 完了条件
```

## 3. ドメインモデル実装ルール

### 3.1 型を明示する

TypeScriptの型は明示的に定義する。

```ts
export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};
```

型推論に任せすぎず、ドメインとして意味のある型を作る。

### 3.2 IDは文字列で扱う

ドメインオブジェクトのIDは原則として文字列で扱う。

```ts
type ProjectId = string;
type FeatureId = string;
type ScreenId = string;
```

必要に応じて branded type を検討してよいが、初期実装では過度に複雑にしない。

### 3.3 日時はISO文字列で保存する

IndexedDBに保存する日時はISO 8601文字列で扱う。

```ts
const now = new Date().toISOString();
```

### 3.4 active / deprecated / removed を区別する

テスト設計では、削除された仕様やUIも変更履歴として意味を持つ。

物理削除だけに頼らず、必要なモデルでは `status` を持たせる。

```ts
type LifecycleStatus = "active" | "deprecated" | "removed";
```

### 3.5 TraceLinkにはlinkTypeを持たせる

TraceLinkは単なる関連IDではなく、関連の意味を持つ必要がある。

```ts
type TraceLinkType =
  | "covers"
  | "derived_from"
  | "impacts"
  | "validates"
  | "depends_on"
  | "replaces";
```

`fromType / fromId / toType / toId` だけの実装にしない。

### 3.6 ChangeRecordは変更前後を残す

ChangeRecordには、変更対象、変更種別、変更前、変更後、理由を保存する。

```ts
type ChangeRecord = {
  id: string;
  projectId: string;
  targetType: string;
  targetId: string;
  changeType: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
  createdAt: string;
  updatedAt: string;
};
```

## 4. IndexedDB / Dexie実装ルール

### 4.1 schemaVersionを明示する

DexieのschemaVersionは定数で管理する。

```ts
export const CURRENT_SCHEMA_VERSION = 1;
```

schemaを変更するPRでは、どのtableとindexを変更したかを明確にする。

### 4.2 Project単位の取得を意識する

ほとんどのデータはProject配下に存在する。

各tableには原則として `projectId` を持たせる。

```ts
type Feature = {
  id: string;
  projectId: string;
  name: string;
};
```

### 4.3 よく使う検索条件にはindexを貼る

最低限、以下を想定する。

```text
projects: id
features: id, projectId
screens: id, projectId, featureId
uiNodes: id, projectId, screenId, parentId
businessRules: id, projectId, featureId
viewpoints: id, projectId, featureId
testCases: id, projectId, viewpointId
traceLinks: id, projectId, fromType, fromId, toType, toId
changeRecords: id, projectId, targetType, targetId
```

ただし、最初から過剰なcompound indexを増やしすぎない。

### 4.4 Repository層を経由する

UIコンポーネントからDexieを直接操作しない。

悪い例:

```ts
await db.projects.add(project);
```

良い例:

```ts
await projectRepository.create(input);
```

Repository層に保存・取得・更新・削除の責務を集約する。

## 5. UI実装ルール

### 5.1 Feature Workspace中心にする

MVPでは、管理画面を細かく分けすぎない。

Feature単位で以下の情報を扱えるようにする。

```text
Feature Workspace
- Overview
- Screens / UI Tree
- Data / Rules
- Viewpoints
- Test Cases
- Changes
- Export
```

ユーザーは「機能単位でテスト設計を完成させる」ために使う。個別マスタ管理画面を増やしすぎない。

### 5.2 入力負荷を上げすぎない

すべての項目を必須にしない。

最初は粗く登録し、後から詳細化できる設計にする。

優先入力:

```text
- name
- summary / description
- related screen
- type
- priority / risk
```

詳細入力:

```text
- evidence
- confidence
- constraints
- selectorHint
- business rule relation
- trace links
```

### 5.3 保存されないUIを作らない

フォームを作る場合は、原則として保存処理まで実装する。

例外として、レイアウト枠だけを作るタスクでは、保存処理がないことを明記する。

### 5.4 空状態を丁寧に扱う

初期状態ではデータがない。

一覧画面やWorkspaceでは、空状態の説明と次のアクションを表示する。

例:

```text
まだFeatureがありません。最初の機能を追加してください。
```

## 6. Export / Import実装ルール

### 6.1 JSONはschemaVersionを持つ

ExportBundleには必ずschemaVersionを含める。

```ts
type ExportBundle = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  projectId: string;
  project: Project;
  data: Record<string, unknown[]>;
};
```

### 6.2 Importは最初は新規Projectとして扱う

初期実装では、既存Projectへの上書きimportは行わない。

ID衝突や差分mergeは将来対応とする。

### 6.3 Markdownは人間が読めることを優先する

Markdown exportは、AI用最適化よりもまず人間がレビューしやすいことを優先する。

構成例:

```md
# Feature: ログイン

## Screens

## UI Tree

## Data Types

## Business Rules

## Test Viewpoints

## Test Cases
```

## 7. Chrome拡張実装ルール

### 7.1 対象ページを破壊的に変更しない

Content Scriptは、対象ページのDOMやアプリ状態を破壊的に変更してはいけない。

許容する変更:

- hover highlight用の一時的なoverlay
- picker終了時に削除される一時要素

避ける変更:

- 対象ページのフォーム値変更
- 対象ページのボタンクリック
- 対象アプリのlocalStorage変更
- 対象アプリのIndexedDB変更

### 7.2 DOMから仕様を自動生成しない

Chrome拡張は入力補助であり、仕様生成エンジンではない。

取得してよい情報:

```text
- URL
- title
- tagName
- role
- accessible name
- text
- label
- placeholder
- name
- id
- class
- selectorCandidates
```

DOMから断定してはいけない情報:

```text
- 業務ルール
- 権限条件
- 保存仕様
- API副作用
- テスト優先度
- 仕様上の意図
```

### 7.3 Element Pickerは1要素取り込みから始める

最初からDOM全体スキャンや差分検出を実装しない。

初期実装では、ユーザーが選択した1要素を候補として取り込めればよい。

## 8. テスト実装ルール

### 8.1 Repositoryにはテストを追加する

Repositoryを追加・変更した場合は、最低限以下をテストする。

```text
- create
- list / get
- update
- delete または status変更
- projectIdによる絞り込み
```

### 8.2 Export / Importにはテストを追加する

Export / Importは壊れるとデータ移行に影響するため、必ずテストを追加する。

```text
- export結果にschemaVersionが含まれる
- export結果に必要なtableが含まれる
- importで新規Projectが作成される
- 不正JSONでエラーになる
- schemaVersion不一致でエラーになる
```

### 8.3 UIテストは重要導線から追加する

UIのテストは、すべてを網羅しようとしない。

優先する導線:

```text
- Project作成
- Feature作成
- UiNode作成
- TestViewpoint作成
- TestCase作成
- Export実行
```

## 9. 命名ルール

### 9.1 ドメイン名を安易に省略しない

悪い例:

```text
VP
TC
BR
```

良い例:

```text
TestViewpoint
TestCase
BusinessRule
```

### 9.2 UI表示名と内部名を分ける

内部型名は英語で統一する。

UI文言は日本語でよい。

例:

```ts
type TestViewpoint = {
  id: string;
  title: string;
};
```

```text
画面表示: テスト観点
```

## 10. 禁止事項

以下は、該当タスクで明示されていない限り実装しない。

- AI API呼び出し
- Playwrightテスト自動生成
- クラウド同期
- 認証機能
- 外部SaaS連携
- DOM全体スキャン
- DOM差分の完全自動判定
- 複雑なダッシュボード
- 過剰な状態管理ライブラリ導入
- UIフレームワークの過剰導入

## 11. PR作成時の確認事項

PR本文には以下を含める。

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

## 12. レビュー観点

レビュー時は以下を確認する。

```text
- タスクのScope外の実装が混ざっていないか
- Non-goalsに反していないか
- 型と保存構造が後続フェーズに耐えるか
- UIだけで保存されない機能になっていないか
- Repositoryテストがあるか
- Export / ImportのschemaVersionを壊していないか
- Chrome拡張が対象ページを破壊していないか
- 将来のAI / Playwright連携に必要な情報を失っていないか
```

## 13. 判断に迷った場合

判断に迷った場合は、次の優先順位で判断する。

```text
1. docs/plans/task-breakdown.md の該当タスク
2. docs/plans/implementation-plan.md の該当フェーズ
3. docs/design.md の親設計
4. 既存実装の一貫性
```

それでも判断できない場合は、勝手に実装を広げず、TODOコメントまたは設計メモとして残す。

```ts
// TODO: Phase 7でChangeRecordとの連携を追加する。
```

ただし、TODOを残す場合も、現在のタスクの達成基準は満たすこと。
