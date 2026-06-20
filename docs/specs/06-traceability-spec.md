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
  | 'feature'
  | 'screen'
  | 'uiNode'
  | 'dataType'
  | 'dataEntity'
  | 'dataField'
  | 'businessRule'
  | 'openQuestion'
  | 'state'
  | 'stateTransition'
  | 'flow'
  | 'flowStep'
  | 'errorCase'
  | 'decisionTable'
  | 'testViewpoint'
  | 'testCase'
  | 'traceLink'
  | 'changeRecord'
  | 'evidence';

type TraceLinkType =
  | 'covers'
  | 'derived_from'
  | 'impacts'
  | 'validates'
  | 'depends_on'
  | 'replaces'
  | 'supports';
```

TraceLinkも `EntityBase` を持つ。TraceLinkの削除は、原則として物理削除ではなく `status: "removed"` による無効化とする。

`traceLink` node typeは、TraceLink自体の変更をChangeRecordで記録するために使う。TraceLink同士を無制限に関連づけるための一般用途ではない。

`UiCaptureCandidate` は一時候補であり、TraceNodeTypeには含めない。候補をユーザーが確認・編集して `UiNode` として正本化した後、`UiNode` を起点にTraceLinkを作成する。

## Link type semantics

- `covers`: ある観点やケースが対象をカバーしていることを表す。
- `derived_from`: ある観点、ケース、仕様要素が、別の仕様要素から導出されたことを表す。
- `impacts`: 変更が、観点やケース、既存仕様要素に影響することを表す。
- `validates`: テストケースが、特定のルールや状態を検証することを表す。
- `depends_on`: ある要素が、別の要素に依存していることを表す。
- `replaces`: 変更や新しい要素が、古い要素を置き換えることを表す。
- `supports`: Evidenceが仕様要素や判断を支えていることを表す。

P0では、TestCase手順とUiNodeの関係は `TestStep.targetUiNodeId` を正とする。`TestStep.targetUiNodeId` から導ける `testCase depends_on uiNode` TraceLinkは永続化しない。

## Direction rules

TraceLinkは有向リンクとして扱う。

推奨方向:

- TestViewpoint -> source spec element
- TestCase -> TestViewpoint
- ChangeRecord -> impacted element
- Evidence -> supported element

表示時には、双方向に辿れるようにする。

TestCaseから実行要素への依存関係は、P0では永続TraceLinkではなく `TestStep.targetUiNodeId` から計算できる関係として扱う。

## UiCaptureCandidate trace policy

`UiCaptureCandidate` は、DOM CaptureやAccessibility Tree Captureから得られた一時候補である。候補段階のデータは仕様正本ではないため、原則としてTraceLink対象にしない。

方針:

- 候補をそのままTraceNodeTypeへ追加しない。
- 候補から作成された `UiNode` をTraceLink対象にする。
- 候補由来であることを残したい場合は、`UiNode` の補助メタ情報、またはChangeRecordの `before` / `after` / `reason` に記録する。
- 候補を起点にTestViewpointやTestCaseを自動生成しない。
- 候補と既存UiNodeの差分判定はPhase 7以降のChangeRecord / impact candidateで扱う。

## Allowed TraceLink matrix

TraceLinkの組み合わせは、無制限に許可しない。実装時は次の行列を正とする。

| fromType      | linkType     | toType                                                                                                                                         | 意味                                                                                                       |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| testViewpoint | derived_from | screen / uiNode / dataType / dataEntity / dataField / businessRule / openQuestion / state / stateTransition / flow / errorCase / decisionTable | 観点の根拠                                                                                                 |
| testCase      | covers       | testViewpoint                                                                                                                                  | ケースが観点をカバーする                                                                                   |
| testCase      | validates    | businessRule / stateTransition / errorCase / decisionTable                                                                                     | ケースがルール・状態遷移・異常系・判定表を検証する                                                         |
| testCase      | depends_on   | dataType / dataEntity / dataField / state / flowStep                                                                                           | ケース実行・確認に必要な要素。P0ではUiNode依存は `TestStep.targetUiNodeId` を正とし、永続TraceLinkにしない |
| changeRecord  | impacts      | testViewpoint / testCase / uiNode / dataType / businessRule / openQuestion                                                                     | 変更が対象に影響する                                                                                       |
| changeRecord  | replaces     | feature / screen / uiNode / dataType / businessRule / testViewpoint / testCase                                                                 | 新旧要素の置き換え                                                                                         |
| evidence      | supports     | feature / screen / uiNode / dataType / businessRule / openQuestion / state / flow / testViewpoint / testCase                                   | 根拠資料が対象を支える                                                                                     |

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

## P0 TestStep relationship policy

P0では、TestCase手順とUiNodeの関係は `TestStep.targetUiNodeId` を正とする。

P0では、`TestStep.targetUiNodeId` から導ける `testCase depends_on uiNode` TraceLinkを永続化しない。

理由:

- `TestStep.targetUiNodeId` とTraceLinkで同じ関係を二重管理すると、編集・削除・import時に不整合が起きる。
- P0ではTraceLink自動同期ライフサイクルを実装しない。
- UiNode依存の表示やMarkdown exportが必要な場合は、`TestStep.targetUiNodeId` から計算する。

将来Phaseで `testCase depends_on uiNode` を永続TraceLinkとして扱う場合は、該当タスクで同期・派生生成・cleanupのどれを採用するかを明示する。

## Coverage states

カバレッジ状態はTraceLink単体ではなく、計算結果として扱う。

```ts
type CoverageState = 'not_covered' | 'partially_covered' | 'covered' | 'unknown';
```

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

P0では、高度なTraceLink編集UIは実装しない。
P0では、`TestStep.targetUiNodeId` から導ける `testCase depends_on uiNode` TraceLinkを永続化しない。

### P1

P1では、次のTraceLink作成を追加する。

- ChangeRecord作成時に、承認された影響候補へ `changeRecord impacts target` を作成する。
- UiCaptureCandidateからUiNodeを作成した事実は、TraceLinkではなくUiNode補助メタ情報またはChangeRecordで扱う。

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
- P0では、`TestStep.targetUiNodeId` と `testCase depends_on uiNode` TraceLinkを二重に永続化しない。
- UiCaptureCandidateをTraceLink対象にしない。

## Impact candidate rules

P0では手動紐づけでよいが、Phase 7以降では次の候補提示を行う。

- UiNode変更: そのUiNodeにderived_fromで繋がるViewpoint、またはTestStep.targetUiNodeIdで参照しているTestCaseを候補表示する。
- DataType変更: そのDataTypeにderived_fromで繋がるViewpointを候補表示する。
- BusinessRule変更: そのBusinessRuleをderived_from / validatesするViewpoint/TestCaseを候補表示する。
- OpenQuestion更新: そのOpenQuestionにderived_fromで繋がるViewpointと、それをcoversするTestCaseを候補表示する。
- selector-changed / accessible-name-changed / role-changed / state-changed: automationSuitabilityがhigh/mediumのTestCaseを候補表示する。

## Non-goals

P0では次を行わない。

- グラフDBの導入
- 高度な可視化グラフ
- 任意TraceLink編集UI
- ChangeRecord impact traceの本格UI
- TestStep.targetUiNodeIdから導ける `testCase depends_on uiNode` TraceLinkの永続化
- UiCaptureCandidateをTraceLink正本対象にすること
- 自動影響分析の完全正確性保証
- 外部テスト管理ツールとのカバレッジ同期

Phase 7では手動確認を前提に影響候補表示を実装する。自動確定は行わない。
