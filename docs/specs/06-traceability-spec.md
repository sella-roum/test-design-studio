# Traceability Spec

## Purpose

Traceability は、仕様要素、テスト観点、テストケース、変更履歴の関係を追跡するための仕組みである。

Test Design Studio の価値は、単にテストケースを保存することではなく、次の問いに答えられることにある。

- このテスト観点は何に基づいているか。
- このテストケースはどの観点を検証しているか。
- このUIや業務ルールが変わると、どの観点・ケースに影響するか。
- どの仕様要素にテスト観点が存在しないか。

## TraceLink model

```ts
type TraceLink = {
  id: string;
  projectId: string;
  fromType: TraceNodeType;
  fromId: string;
  toType: TraceNodeType;
  toId: string;
  linkType: TraceLinkType;
  reason?: string;
  createdAt: string;
};

type TraceNodeType =
  | "feature"
  | "screen"
  | "uiNode"
  | "dataType"
  | "dataEntity"
  | "dataField"
  | "businessRule"
  | "testViewpoint"
  | "testCase"
  | "changeRecord"
  | "evidence";

type TraceLinkType =
  | "covers"
  | "derived_from"
  | "impacts"
  | "validates"
  | "depends_on"
  | "replaces";
```

## Link type semantics

### covers

ある観点やケースが、仕様要素をカバーしていることを表す。

例:

```text
TestViewpoint covers BusinessRule
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

## Direction rules

TraceLinkは有向リンクとして扱う。

推奨方向:

```text
TestViewpoint -> source spec element
TestCase -> TestViewpoint
ChangeRecord -> impacted element
Evidence -> supported element
```

ただし表示時には、双方向に辿れるようにする。

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

## Traceability views

初期実装では、次の表示を優先する。

### Feature trace summary

Feature単位で、仕様要素から観点・ケースへの紐づきを確認する。

表示対象:

- UiNode
- DataType
- BusinessRule
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

## Integrity rules

- fromId/toIdの参照先が存在することを可能な範囲で検証する。
- 同一のfrom/to/linkTypeの重複登録を避ける。
- 対象要素がremovedになってもTraceLinkは保持する。
- 表示時はremoved対象であることが分かるようにする。

## Impact candidate rules

初期実装では手動紐づけでよいが、Phase 7以降では次の候補提示を行う。

```text
UiNode変更
→ そのUiNodeにderived_from / depends_onで繋がるViewpoint/TestCaseを候補表示

DataType変更
→ そのDataTypeにderived_fromで繋がるViewpointを候補表示

BusinessRule変更
→ そのBusinessRuleをcovers / validatesするViewpoint/TestCaseを候補表示

selector-changed
→ automationSuitabilityがhigh/mediumのTestCaseを候補表示
```

## Non-goals

初期実装では次を行わない。

- グラフDBの導入
- 高度な可視化グラフ
- 自動影響分析の完全正確性保証
- 外部テスト管理ツールとのカバレッジ同期
