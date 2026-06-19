# Domain Model

## Purpose

この文書は、Test Design Studio の実装で正本として扱うドメインモデルを定義する。

`docs/design.md` には長期構想を含む多くのモデル案があるが、実装時はこの文書に記載されたモデルを優先する。

## Staged model policy

Test Design Studio は、MVPをP0、P1、P2で段階実装する。

- P0: Webアプリ単体で1機能分の仕様把握、観点、ケース、Markdown/JSON出力までを成立させる。
- P1: Chrome拡張、DomCaptureCandidate、変更管理、影響追跡を追加する。
- P2: 技法ワークベンチ、AI context export、Playwright draft exportを追加する。

P0で専用UIを作らないモデルでも、後続フェーズで破壊的変更を避けるために型・保存対象・export対象として予約する場合がある。

## Common conventions

Projectを含む永続化モデルは、原則として次の共通フィールドを持つ。

```ts
type EntityStatus = "active" | "deprecated" | "removed";

type Confidence = "confirmed" | "tentative" | "assumed" | "unknown";

type Priority = "high" | "medium" | "low";

type AutomationSuitability = "high" | "medium" | "low" | "manual-only";

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

P0ではFeatureにユースケース情報も保持する。将来的に複数ユースケースを1Feature配下で扱う必要が出た場合は、`UseCase` モデルへ分離する。

```ts
type Feature = EntityBase & {
  name: string;
  description?: string;
  purpose?: string;
  actor?: string;
  preconditions?: string;
  successCriteria?: string;
  failureConditions?: string;
  priority?: Priority;
  riskLevel?: Priority;
  confidence?: Confidence;
};
```

## Screen

機能に関連する画面。URLや画面名、画面の目的を保持する。

```ts
type ScreenType =
  | "list"
  | "detail"
  | "create"
  | "edit"
  | "confirm"
  | "complete"
  | "error"
  | "settings"
  | "login"
  | "dashboard"
  | "admin"
  | "other";

type Screen = EntityBase & {
  featureId: string;
  name: string;
  screenType?: ScreenType;
  urlPattern?: string;
  purpose?: string;
  preconditions?: string;
  description?: string;
  confidence?: Confidence;
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

業務ルール、バリデーション、権限制御、表示条件、保存条件、エラー、例外などを表す。

```ts
type BusinessRuleType =
  | "validation"
  | "permission"
  | "display"
  | "calculation"
  | "workflow"
  | "error"
  | "exception"
  | "other";

type BusinessRule = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  name: string;
  description: string;
  ruleType: BusinessRuleType;
  confidence: Confidence;
};
```

P0では `ErrorCase` を独立実装せず、エラー・例外は `BusinessRule.ruleType` の `error` / `exception` で表現してよい。P2以降で異常系を詳細化する場合は、Reserved modelの `ErrorCase` を利用する。

## OpenQuestion

未確認事項、仮説、要確認の仕様を表す。

未確認事項を `description` や `note` に埋め込むと、どの仕様が未確定のままテスト設計に使われているか追えなくなる。そのため、P0から独立モデルとして扱う。

```ts
type OpenQuestionStatus = "open" | "answered" | "deferred" | "not_applicable";

type OpenQuestion = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  question: string;
  context?: string;
  answer?: string;
  questionStatus: OpenQuestionStatus;
  confidence: Confidence;
};
```

`status` はEntityStatusとして使うため、未確認事項としての状態は `questionStatus` で表現する。

`featureId` / `screenId` / `uiNodeId` は、P0の入力UIで未確認事項を主要な作業文脈へ素早く紐づけるための補助フィールドである。OpenQuestionと他モデルの汎用的な関係は `relatedType` / `relatedId` のような二重管理フィールドではなく、TraceLinkを正本として表現する。

## TestViewpoint

テストケースの前段となる観点。何を確認すべきかを表す。

```ts
type TestTechnique =
  | "equivalence"
  | "boundary"
  | "state-transition"
  | "decision-table"
  | "use-case"
  | "exploratory";

type TestViewpoint = EntityBase & {
  featureId: string;
  title: string;
  description?: string;
  technique?: TestTechnique;
  priority?: Priority;
  automationSuitability?: AutomationSuitability;
  automationReason?: string;
};
```

`automationReason` は、自動化しやすい・しにくい理由を説明するために保持する。後続のAI/Playwright exportで参照する。

## TestCase

具体的な確認手順と期待結果。

P0から `steps: string[]` ではなく構造化された `TestStep[]` として保存する。これは将来のPlaywright draft exportに備えるためであり、P0のUIでは簡易入力から `TestStep` に変換してもよい。

```ts
type TestStepAction =
  | "navigate"
  | "click"
  | "fill"
  | "select"
  | "check"
  | "assert"
  | "wait"
  | "other";

type TestStep = {
  id: string;
  order: number;
  action: TestStepAction;
  targetUiNodeId?: string;
  instruction: string;
  expectedResult?: string;
  testData?: string;
};

type TestCase = EntityBase & {
  viewpointId?: string;
  featureId: string;
  title: string;
  preconditions?: string;
  steps: TestStep[];
  expectedResult?: string;
  testData?: string;
  priority?: Priority;
  automationSuitability?: AutomationSuitability;
  automationReason?: string;
};
```

`expectedResult` はケース全体の期待結果を表す。各手順に対応する期待結果は `TestStep.expectedResult` を使う。

## TraceLink

仕様要素、観点、ケース、変更履歴の関係を表す。

```ts
type TraceNodeType =
  | "feature"
  | "screen"
  | "uiNode"
  | "dataType"
  | "dataEntity"
  | "dataField"
  | "businessRule"
  | "openQuestion"
  | "state"
  | "stateTransition"
  | "flow"
  | "flowStep"
  | "errorCase"
  | "decisionTable"
  | "testViewpoint"
  | "testCase"
  | "traceLink"
  | "changeRecord"
  | "domCaptureCandidate"
  | "evidence";

type TraceLinkType =
  | "covers"
  | "derived_from"
  | "impacts"
  | "validates"
  | "depends_on"
  | "replaces"
  | "supports";

type TraceLink = EntityBase & {
  fromType: TraceNodeType;
  fromId: string;
  toType: TraceNodeType;
  toId: string;
  linkType: TraceLinkType;
  reason?: string;
};
```

`linkType` は必須とする。単に `from` と `to` だけを保存すると、関係の意味が曖昧になるためである。

TraceLinkも `EntityBase` を持つ。Traceabilityでは過去の根拠を残す価値があるため、削除時は原則として物理削除ではなく `status: "removed"` で無効化する。

`traceLink` はTraceLink自体の変更履歴をChangeRecordで記録するために `TraceNodeType` に含める。TraceLink同士を無制限に結ぶためのものではない。

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
  targetType: TraceNodeType;
  targetId: string;
  changeType: ChangeType;
  summary: string;
  before?: string;
  after?: string;
  reason?: string;
  confidence: Confidence;
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

仕様判断の根拠を表す。P0では必須ではないが、モデルとして予約する。

```ts
type Evidence = EntityBase & {
  sourceType: "spec" | "figma" | "notion" | "slack" | "meeting" | "implementation" | "manual-observation" | "other";
  title: string;
  url?: string;
  quote?: string;
  note?: string;
  confidence: Confidence;
};
```

P0では `Evidence` Repository は必須にしない。ExportBundleでは `evidences?: Evidence[]` として任意扱いにする。

## Reserved future models

次のモデルは親設計書と後続フェーズで必要になるため予約する。P0で専用UIやRepositoryを必ず実装する必要はないが、schemaVersion、ExportBundle、TraceNodeTypeを設計する際に破壊的変更が起きないよう考慮する。

### State / StateTransition

```ts
type StateScope = "app" | "session" | "screen" | "uiNode" | "form" | "data" | "flow" | "async" | "external";

type State = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  dataEntityId?: string;
  name: string;
  scope: StateScope;
  condition?: string;
  observableResult?: string;
  allowedOperations?: string[];
  prohibitedOperations?: string[];
  confidence: Confidence;
};

type StateTransition = EntityBase & {
  featureId: string;
  targetType: "screen" | "uiNode" | "data" | "flow" | "other";
  targetId?: string;
  fromStateId: string;
  toStateId: string;
  event: string;
  condition?: string;
  expectedResult?: string;
  valid: boolean;
};
```

### Flow / FlowStep

```ts
type Flow = EntityBase & {
  featureId: string;
  name: string;
  purpose?: string;
  startScreenId?: string;
  endScreenId?: string;
  preconditions?: string;
  successCriteria?: string;
  alternativePaths?: string;
  exceptionPaths?: string;
};

type FlowStep = EntityBase & {
  flowId: string;
  order: number;
  screenId?: string;
  uiNodeId?: string;
  operation: string;
  expectedResult?: string;
  branchCondition?: string;
};
```

### ErrorCase

```ts
type ErrorCase = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  trigger: string;
  message?: string;
  recovery?: string;
  severity?: Priority;
  confidence: Confidence;
};
```

P0ではBusinessRuleの `ruleType: "error" | "exception"` で表現してよい。ErrorCaseは、異常系を独立管理する必要が出た段階で使う。

### DecisionTable

```ts
type DecisionTableRule = {
  id: string;
  conditions: Record<string, string>;
  actions: Record<string, string>;
  expectedResult?: string;
};

type DecisionTable = EntityBase & {
  businessRuleId: string;
  conditions: string[];
  actions: string[];
  rules: DecisionTableRule[];
};
```

DecisionTableはPhase 8以降の技法ワークベンチで扱う。

## Relationship summary

- Project has many Features.
- Feature has many Screens.
- Feature can have many OpenQuestions.
- Screen has many UiNodes.
- Feature has many BusinessRules.
- Feature has many TestViewpoints.
- TestViewpoint has many TestCases.
- TestCase has many TestSteps.
- TraceLink connects supported model pairs with a typed relationship.
- ChangeRecord records changes to supported models.
- DomCaptureCandidate can be converted into UiNode after review.
- State, StateTransition, Flow, FlowStep, ErrorCase, DecisionTable are reserved for staged MVP expansion.

## Implementation notes

- UIからDexieを直接操作しない。
- Repository層で各モデルのCRUDを提供する。
- `status !== "removed"` を通常表示の基本条件にする。
- `updatedAt` は更新時に必ず変更する。
- P0でUI化しないReserved modelを先取り実装しない。ただし、TraceNodeTypeやExportBundleのoptional fieldとして破壊的変更を避ける準備はしてよい。
