# Domain Model

## Purpose

この文書は、Test Design Studio の実装で正本として扱うドメインモデルを定義する。

`docs/design.md` には長期構想を含む多くのモデル案があるが、実装時はこの文書に記載されたモデルを優先する。

## Common conventions

Projectを含む永続化モデルは、原則として次の共通フィールドを持つ。

```ts
type EntityStatus = "active" | "deprecated" | "removed";

type EntityBase = {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  status: EntityStatus;
};
```

### ID

- IDはアプリケーション側で生成する。
- 初期実装ではUUIDを想定する。
- import時のID衝突に備え、将来的にID再割当を可能にする。

### status

- `active`: 現在有効。
- `deprecated`: 非推奨だが履歴・参照のため残す。
- `removed`: 論理削除済み。

初期実装では物理削除よりも論理削除を優先する。

## Project

プロジェクト全体を表す最上位単位。

Projectは `projectId` を持たないが、削除・非推奨・履歴保持の方針を他モデルと揃えるため、`status` を持つ。

```ts
type Project = {
  id: string;
  name: string;
  description?: string;
  targetAppName?: string;
  targetAppUrl?: string;
  schemaVersion: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
};
```

通常のProject一覧では `status !== "removed"` を表示対象にする。

## Feature

テスト設計の主な作業単位。ログイン、ユーザー管理、検索、予約作成など、業務上意味のある機能を表す。

```ts
type Feature = EntityBase & {
  name: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  riskLevel?: "high" | "medium" | "low";
};
```

## Screen

機能に関連する画面。URLや画面名、画面の目的を保持する。

```ts
type Screen = EntityBase & {
  featureId: string;
  name: string;
  urlPattern?: string;
  description?: string;
};
```

## UiNode

テスト設計上意味のあるUI要素。DOMノードの完全コピーではない。

```ts
type UiNode = EntityBase & {
  screenId: string;
  parentId?: string;
  name: string;
  role?: string;
  componentType?: string;
  description?: string;
  selectorHint?: string;
  textHint?: string;
  required?: boolean;
  disabledCondition?: string;
  visibleCondition?: string;
  sortOrder: number;
};
```

### UiNodeの扱い

- DOMをそのまま保存しない。
- テスト設計上意味のある単位に整理する。
- ボタン、フォーム、テーブル、モーダル、タブ、メニューなどを想定する。
- `componentType` は初期実装では自由入力の文字列とする。
- `UiNodeType` enum は初期実装では定義しない。現実のUI分類で詰まりやすいため、必要になった段階で追加する。
- `selectorHint` はPlaywright生成やChrome拡張連携の補助情報であり、仕様そのものではない。
- 表示ラベルは `textHint` または `name` で表現し、`label` フィールドは初期モデルには追加しない。

## DataEntity

業務データのまとまり。ユーザー、契約、予約、コメントなどを表す。

```ts
type DataEntity = EntityBase & {
  name: string;
  description?: string;
};
```

## DataField

業務データのフィールド。

```ts
type DataField = EntityBase & {
  entityId: string;
  name: string;
  dataTypeId?: string;
  required?: boolean;
  unique?: boolean;
  description?: string;
};
```

## DataType

入力値や値域の性質。メールアドレス、日付、金額、文字列長などを表す。

```ts
type DataType = EntityBase & {
  name: string;
  baseType: "string" | "number" | "boolean" | "date" | "enum" | "object";
  description?: string;
  constraints?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    enumValues?: string[];
  };
  validExamples?: string[];
  invalidExamples?: string[];
};
```

## BusinessRule

業務ルール、バリデーション、権限制御、表示条件、保存条件などを表す。

```ts
type BusinessRule = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  name: string;
  description: string;
  ruleType: "validation" | "permission" | "display" | "calculation" | "workflow" | "other";
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
};
```

## TestViewpoint

テストケースの前段となる観点。何を確認すべきかを表す。

```ts
type TestViewpoint = EntityBase & {
  featureId: string;
  title: string;
  description?: string;
  technique?: "equivalence" | "boundary" | "state-transition" | "decision-table" | "use-case" | "exploratory";
  priority?: "high" | "medium" | "low";
  automationSuitability?: "high" | "medium" | "low" | "manual-only";
};
```

## TestCase

具体的な確認手順と期待結果。

```ts
type TestCase = EntityBase & {
  viewpointId?: string;
  featureId: string;
  title: string;
  preconditions?: string;
  steps: string[];
  expectedResult: string;
  testData?: string;
  priority?: "high" | "medium" | "low";
  automationSuitability?: "high" | "medium" | "low" | "manual-only";
};
```

## TraceLink

仕様要素、観点、ケース、変更履歴の関係を表す。

```ts
type TraceLinkType = "covers" | "derived_from" | "impacts" | "validates" | "depends_on" | "replaces";

type TraceLink = {
  id: string;
  projectId: string;
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  linkType: TraceLinkType;
  reason?: string;
  createdAt: string;
};
```

`linkType` は必須とする。単に `from` と `to` だけを保存すると、関係の意味が曖昧になるためである。

## ChangeRecord

仕様、UI、業務ルール、テスト観点、テストケースの変更を記録する。

```ts
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

type ChangeRecord = EntityBase & {
  targetType: string;
  targetId: string;
  changeType: ChangeType;
  summary: string;
  before?: string;
  after?: string;
  reason?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
};
```

`ChangeType` は `docs/specs/07-change-management-spec.md` と同じ値を使う。

## DomCaptureCandidate

Chrome拡張で取得したDOM候補をWebアプリ側でレビューするための一時的な候補モデル。

```ts
type CapturedElement = {
  tagName: string;
  role?: string;
  accessibleName?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  name?: string;
  id?: string;
  className?: string;
  inputType?: string;
  required?: boolean;
  disabled?: boolean;
  visible?: boolean;
  selectorCandidates: string[];
};

type DomCaptureCandidate = {
  id: string;
  projectId?: string;
  featureId?: string;
  screenId?: string;
  sourceUrl: string;
  sourceTitle?: string;
  capturedAt: string;
  element: CapturedElement;
  suggestedUiNode?: {
    name?: string;
    role?: string;
    componentType?: string;
    selectorHint?: string;
    textHint?: string;
    required?: boolean;
  };
  status: "candidate" | "accepted" | "rejected";
};
```

`DomCaptureCandidate` は仕様の正本ではない。ユーザーが確認・編集し、必要に応じて `UiNode` に変換する。

## Evidence

仕様判断の根拠を表す。初期実装では必須ではないが、モデルとして予約する。

```ts
type Evidence = EntityBase & {
  sourceType: "spec" | "figma" | "notion" | "slack" | "meeting" | "implementation" | "manual-observation" | "other";
  title: string;
  url?: string;
  quote?: string;
  note?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
};
```

初期実装では `Evidence` Repository は必須にしない。ExportBundleでは `evidences?: Evidence[]` として任意扱いにする。

## Relationship summary

- Project has many Features.
- Feature has many Screens.
- Screen has many UiNodes.
- Feature has many BusinessRules.
- Feature has many TestViewpoints.
- TestViewpoint has many TestCases.
- TraceLink connects any supported model pair.
- ChangeRecord records changes to supported models.
- DomCaptureCandidate can be converted into UiNode after review.

## Implementation notes

- UIからDexieを直接操作しない。
- Repository層で各モデルのCRUDを提供する。
- `status !== "removed"` を通常表示の基本条件にする。
- `updatedAt` は更新時に必ず変更する。
