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
```

TraceLinkも `EntityBase` を持つ。TraceLinkの削除は、原則として物理削除ではなく `status: "removed"` による無効化とする。

`traceLink` node typeは、TraceLink自体の変更をChangeRecordで記録するために使う。TraceLink同士を無制限に関連づけるための一般用途ではない。

## Link type semantics

### covers

ある観点やケースが、対象をカバーしていることを表す。

例:

```text
TestCase covers TestViewpoint
```

### derived_from

ある観点、ケース、仕様要素が、別の仕様要素や候補から導出されたことを表す。

例:

```text
TestViewpoint derived_from DataType
TestViewpoint derived_from UiNode
UiNode derived_from DomCaptureCandidate
```

### impacts

変更や候補が、観点やケース、既存仕様要素に影響することを表す。

例:

```text
ChangeRecord impacts TestCase
ChangeRecord impacts TestViewpoint
DomCaptureCandidate impacts UiNode
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
UiNode -> DomCaptureCandidate
ChangeRecord -> impacted element
Evidence -> supported element
```

ただし表示時には、双方向に辿れるようにする。

## Allowed TraceLink matrix

TraceLinkの組み合わせは、無制限に許可しない。実装時は次の行列を正とする。

| fromType | linkType | toType | 意味 |
|---|---|---|---|
| testViewpoint | derived_from | screen / uiNode / dataType / dataEntity / dataField / businessRule / openQuestion / state / stateTransition / flow / errorCase / decisionTable | 観点の根拠 |
| testCase | covers | testViewpoint | ケースが観点をカバーする |
| testCase | validates | businessRule / stateTransition / errorCase / decisionTable | ケースがルール・状態遷移・異常系・判定表を検証する |
| testCase | depends_on | uiNode / dataType / dataEntity / dataField / state / flowStep | ケース実行・確認に必要な要素 |
| uiNode | derived_from | domCaptureCandidate | レビュー済みUI要素がDOM候補から作られた |
| domCaptureCandidate | impacts | uiNode | DOM候補が既存UI要素の更新候補である |
| changeRecord | impacts | testViewpoint / testCase / uiNode / dataType / businessRule / openQuestion | 変更が対象に影響する |
| changeRecord | replaces | feature / screen / uiNode / dataType / businessRule / testViewpoint / testCase | 新旧要素の置き換え |
| evidence | supports | feature / screen / uiNode / dataType / businessRule / openQuestion / state / flow / testViewpoint / testCase | 根拠資料が対象を支える |

上記以外の組み合わせが必要になった場合は、この仕様を更新してから実装する。

同一 `fromType/fromId/toType/toId` に複数の `linkType` を付ける場合は、`reason` を必須にする。

## Staged link policy

P0では、TraceNodeTypeの型として将来候補を含めてもよい。ただし、P0 UIで選択肢に出してよい対象は、P0でRepositoryと編集UIが存在するモデルに限定する。

### P0 storage-level TraceNodeTypes

P0の保存層で扱える主なTraceNodeType:

- feature
- screen
- uiNode
- dataType
- dataEntity
- dataField
- businessRule
- openQuestion
- testViewpoint
- testCase
- traceLink
- changeRecord

P0 importerは、TraceLink / ChangeRecordについても上記のstorage-level TraceNodeTypeのみを有効な参照先として扱う。詳細は `docs/specs/05-import-export-spec.md` を正とする。

### P0 UI-selectable TraceNodeTypes

P0のUIでTestViewpointのsource elementとして選択してよいTraceNodeType:

- screen
- uiNode
- dataType
- dataEntity
- dataField
- businessRule
- openQuestion

`testViewpoint` は、P0のsource element選択肢には含めない。TestCaseからTestViewpointへの関係は、source elementではなく `testCase covers testViewpoint` として扱う。

`traceLink` と `changeRecord` は、P0では内部保存対象として扱ってよいが、専用UIの選択肢には出さない。これらはPhase 7のTraceLink UI / ChangeRecord UIで扱う。

Reserved modelへのTraceLinkは、該当モデルのRepositoryが実装されたPhase以降で許可する。

P0でReserved modelが `TraceNodeType` に含まれていても、それは将来の破壊的変更を避けるための予約であり、UIで選択できることを意味しない。

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

ChangeRecordを含む影響追跡ビューはPhase 7で扱う。

### Viewpoint trace

TestViewpointごとに、元になった仕様要素と関連TestCaseを表示する。

### Change impact trace

ChangeRecordごとに、影響する観点・ケースを表示する。実装はPhase 7を正とする。

## Link creation timing by phase

### P0

P0では、次のTraceLink作成を優先する。

- TestViewpoint作成時に、選択されたsource elementへ `testViewpoint derived_from source` を作成する。
- TestCase作成時に、紐づくTestViewpointへ `testCase covers testViewpoint` を作成する。
- TestCaseの手順でUiNodeを参照する場合、必要に応じて `testCase depends_on uiNode` を作成する。

P0では、高度なTraceLink編集UIは実装しない。

### P1

P1では、次のTraceLink作成を追加する。

- DomCaptureCandidateをUiNodeとして採用したときに `uiNode derived_from domCaptureCandidate` を作成する。
- 既存UiNodeに対するDOM更新候補として扱う場合は `domCaptureCandidate impacts uiNode` を作成する。
- ChangeRecord作成時に、承認された影響候補へ `changeRecord impacts target` を作成する。

### P2

P2では、次のTraceLink作成を追加する。

- 技法ワークベンチからTestViewpointを作成したときに、元要素へ `testViewpoint derived_from source` を作成する。
- Evidenceを登録したときに対象要素へ `evidence supports target` を作成する。

## Integrity rules

- fromId/toIdの参照先が存在することを可能な範囲で検証する。
- 同一のfrom/to/linkTypeの重複登録を避ける。
- 対象要素がremovedになってもTraceLinkは保持する。
- TraceLink自体を無効化する場合は `status: "removed"` にする。
- 表示時はremoved対象であることが分かるようにする。
- Allowed TraceLink matrixにない組み合わせは、実装前に仕様を更新する。
- P0 UIでは未実装RepositoryのReserved modelをTraceLink対象に出さない。

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
- 任意TraceLink編集UI
- ChangeRecord impact traceの本格UI
- 自動影響分析の完全正確性保証
- 外部テスト管理ツールとのカバレッジ同期

Phase 7では手動確認を前提に影響候補表示を実装する。自動確定は行わない。
