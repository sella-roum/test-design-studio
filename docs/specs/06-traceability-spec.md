# Traceability Spec

## Purpose

Traceability は、仕様要素、テスト観点、テストケース、変更履歴の関係を追跡するための仕組みである。

Test Design Studio の価値は、単にテストケースを保存することではなく、次の問いに答えられることにある。

- このテスト観点は何に基づいているか。
- このテストケースはどの観点を検証しているか。
- このUIや業務ルールが変わると、どの観点・ケースに影響するか。
- どの仕様要素にテスト観点が存在しないか。
- 未確認事項に基づいて作られた観点・ケースはどれか。

## TraceLink model

```ts
type TraceLink = EntityBase & {
  fromType: TraceNodeType;
  fromId: string;
  toType: TraceNodeType;
  toId: string;
  linkType: TraceLinkType;
  reason?: string;
};

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
```

TraceLinkも `EntityBase` を持つ。TraceLinkの削除は、原則として物理削除ではなく `status: "removed"` による無効化とする。

## Link type semantics

### covers

ある観点やケースが、対象をカバーしていることを表す。

例:

```text
TestCase covers TestViewpoint
```

### derived_from

ある観点やケースが、仕様要素から導出されたことを表す。

例:

```text
TestViewpoint derived_from DataType
TestViewpoint derived_from UiNode
```

### impacts

変更が、観点やケースに影響することを表す。

例:

```text
ChangeRecord impacts TestCase
ChangeRecord impacts TestViewpoint
```

### validates

テストケースが、特定のルールや状態を検証することを表す。

例:

```text
TestCase validates BusinessRule
TestCase validates StateTransition
```

### depends_on

ある要素が、別の要素に依存していることを表す。

例:

```text
TestCase depends_on UiNode
```

### replaces

変更や新しい要素が、古い要素を置き換えることを表す。

例:

```text
ChangeRecord replaces UiNode
```

### supports

Evidenceが仕様要素や判断を支えていることを表す。

例:

```text
Evidence supports BusinessRule
Evidence supports TestViewpoint
```

## Direction rules

TraceLinkは有向リンクとして扱う。

推奨方向:

```text
TestViewpoint -> source spec element
TestCase -> TestViewpoint
TestCase -> required execution element
ChangeRecord -> impacted element
Evidence -> supported element
```

ただし表示時には、双方向に辿れるようにする。

## Allowed TraceLink matrix

TraceLinkの組み合わせは、無制限に許可しない。実装時は次の行列を正とする。

| fromType | linkType | toType | 意味 |
|---|---|---|---|
| testViewpoint | derived_from | uiNode / dataType / dataEntity / dataField / businessRule / openQuestion / state / stateTransition / flow / errorCase / decisionTable | 観点の根拠 |
| testCase | covers | testViewpoint | ケースが観点をカバーする |
| testCase | validates | businessRule / stateTransition / errorCase / decisionTable | ケースがルール・状態遷移・異常系・判定表を検証する |
| testCase | depends_on | uiNode / dataType / dataEntity / dataField / state / flowStep | ケース実行・確認に必要な要素 |
| changeRecord | impacts | testViewpoint / testCase / uiNode / dataType / businessRule / openQuestion | 変更が対象に影響する |
| changeRecord | replaces | feature / screen / uiNode / dataType / businessRule / testViewpoint / testCase | 新旧要素の置き換え |
| evidence | supports | feature / screen / uiNode / dataType / businessRule / openQuestion / state / flow / testViewpoint / testCase | 根拠資料が対象を支える |
| domCaptureCandidate | derived_from | screen / uiNode | DOM候補が画面・UI要素候補から来ている |

上記以外の組み合わせが必要になった場合は、この仕様を更新してから実装する。

同一 `fromType/fromId/toType/toId` に複数の `linkType` を付ける場合は、`reason` を必須にする。

## Coverage states

カバレッジ状態はTraceLink単体ではなく、計算結果として扱う。

```ts
type CoverageState = "not_covered" | "partially_covered" | "covered" | "unknown";
```

例:

- BusinessRuleに関連するTestViewpointがない場合: `not_covered`
- TestViewpointはあるがTestCaseがない場合: `partially_covered`
- TestViewpointとTestCaseがある場合: `covered`
- 仕様の確度がunknownの場合: `unknown`
- OpenQuestionに基づく観点・ケースがある場合: `unknown` または `partially_covered` として扱い、未確認であることを表示する

### Coverage target by phase

P0で優先するカバレッジ対象:

- UiNode
- DataType
- BusinessRule
- OpenQuestion
- TestViewpoint

P1以降で追加するカバレッジ対象:

- ChangeRecord impact target
- State / StateTransition
- Flow / FlowStep
- ErrorCase
- DecisionTable

## Traceability views

初期実装では、次の表示を優先する。

### Feature trace summary

Feature単位で、仕様要素から観点・ケースへの紐づきを確認する。

表示対象:

- UiNode
- DataType
- BusinessRule
- OpenQuestion
- TestViewpoint
- TestCase
- ChangeRecord

### Viewpoint trace

TestViewpointごとに、元になった仕様要素と関連TestCaseを表示する。

### Change impact trace

ChangeRecordごとに、影響する観点・ケースを表示する。

## Link creation

TraceLinkは次のタイミングで作成できる。

- 利用者が手動で紐づける。
- TestCase作成時にViewpointへ自動リンクする。
- 技法ワークベンチからViewpointを作成したときに元要素へ自動リンクする。
- ChangeRecord作成時に影響候補を承認したときにリンクする。
- Evidenceを登録したときに対象要素へ `supports` でリンクする。

P0では、TestCaseとTestViewpointの関係、TestViewpointと元仕様要素の関係を優先する。高度なTraceLink編集UIはPhase 7で扱う。

## Integrity rules

- fromId/toIdの参照先が存在することを可能な範囲で検証する。
- 同一のfrom/to/linkTypeの重複登録を避ける。
- 対象要素がremovedになってもTraceLinkは保持する。
- TraceLink自体を無効化する場合は `status: "removed"` にする。
- 表示時はremoved対象であることが分かるようにする。
- Allowed TraceLink matrixにない組み合わせは、実装前に仕様を更新する。

## Impact candidate rules

P0では手動紐づけでよいが、Phase 7以降では次の候補提示を行う。

```text
UiNode変更
→ そのUiNodeにderived_from / depends_onで繋がるViewpoint/TestCaseを候補表示

DataType変更
→ そのDataTypeにderived_fromで繋がるViewpointを候補表示

BusinessRule変更
→ そのBusinessRuleをderived_from / validatesするViewpoint/TestCaseを候補表示

OpenQuestion更新
→ そのOpenQuestionにderived_fromで繋がるViewpointと、それをcoversするTestCaseを候補表示

selector-changed
→ automationSuitabilityがhigh/mediumのTestCaseを候補表示
```

## Non-goals

P0では次を行わない。

- グラフDBの導入
- 高度な可視化グラフ
- 自動影響分析の完全正確性保証
- 外部テスト管理ツールとのカバレッジ同期

Phase 7では手動確認を前提に影響候補表示を実装する。自動確定は行わない。
