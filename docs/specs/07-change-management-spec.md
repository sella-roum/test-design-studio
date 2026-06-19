# Change Management Spec

## Purpose

Change Management は、仕様・UI・業務ルール・テスト設計の変更を記録し、後から変更理由と影響範囲を追えるようにするための仕組みである。

Test Design Studio では、既存UIや既存仕様の変更を新規追加と同じくらい重要な情報として扱う。

## ChangeRecord model

```ts
type ChangeRecord = {
  id: string;
  projectId: string;
  targetType: string;
  targetId: string;
  changeType: ChangeType;
  summary: string;
  before?: string;
  after?: string;
  reason?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
  status: "active" | "deprecated" | "removed";
  createdAt: string;
  updatedAt: string;
};

type ChangeType =
  | "added"
  | "updated"
  | "deprecated"
  | "removed"
  | "selector-changed"
  | "behavior-changed"
  | "validation-changed"
  | "display-changed"
  | "permission-changed";
```

## Target types

ChangeRecordは、少なくとも次の対象に紐づけられる。

```text
feature
screen
uiNode
dataType
dataEntity
dataField
businessRule
testViewpoint
testCase
traceLink
```

## Change confidence

変更情報の確度を保持する。

- `confirmed`: 仕様書、実装、担当者確認などで確定している。
- `tentative`: ほぼ確からしいが確認待ち。
- `assumed`: 推測で登録している。
- `unknown`: 確度不明。

`assumed` や `unknown` の情報からテストケースを作る場合は、Markdown exportで分かるようにする。

## Change workflow

### Existing element update

既存要素を変更する場合の基本フロー:

1. 対象要素を選択する。
2. 変更内容を編集する。
3. ChangeRecordを作成する。
4. before/afterまたはsummaryを記録する。
5. 影響するTestViewpoint/TestCaseを確認する。
6. 必要に応じてTraceLinkを作成する。

### DOM candidate to existing UiNode

Chrome拡張で取得した候補が既存UiNodeの変更を示す場合:

1. DomCaptureCandidateを確認する。
2. 既存UiNodeを選択する。
3. 変更種別を選ぶ。
4. selectorHint、textHint、roleなどを更新する。
5. ChangeRecordを作成する。
6. 影響候補を確認する。

## Before / after representation

初期実装では、before/afterは文字列で保持してよい。

将来的には差分対象ごとに構造化する。

```ts
type StructuredChangeDiff = {
  field: string;
  before: unknown;
  after: unknown;
};
```

ただし初期実装では、実装負荷を抑えるため、summaryとbefore/afterのテキスト表現を優先する。

## Impact candidates

Phase 7以降では、ChangeRecord作成時に影響候補を提示する。

### UiNode changed

```text
UiNode updated
→ related TestViewpoint
→ related TestCase
```

### DataType changed

```text
DataType constraints changed
→ generated or linked TestViewpoint
→ boundary/equivalence related TestCase
```

### BusinessRule changed

```text
BusinessRule updated
→ validating TestCase
→ covering TestViewpoint
```

### selector changed

```text
selectorHint changed
→ automationSuitability high/medium TestCase
→ Playwright draft candidates in future phase
```

## Change statuses

ChangeRecord自体もstatusを持つ。

- `active`: 有効な変更履歴。
- `deprecated`: 古い変更履歴として残す。
- `removed`: 論理削除済み。

## Auditability

変更履歴では、次を後から確認できる状態にする。

- 何が変わったか。
- 変更前はどうだったか。
- 変更後はどうなったか。
- なぜ変わったか。
- 確定情報か、推測か。
- どの観点・ケースに影響したか。

## UI requirements

初期実装では、次のUIで十分とする。

- Feature WorkspaceのChanges section
- 対象要素からChangeRecord一覧を表示
- ChangeRecord作成フォーム
- 影響TraceLinkの一覧表示

高度な差分ビューは後続フェーズでよい。

## Non-goals

初期実装では次を行わない。

- Git diffのような構造化差分表示
- DOM差分の完全自動検出
- 変更影響の完全自動確定
- 外部Issue/PRとの自動同期
- 監査ログとしての法的厳密性保証
