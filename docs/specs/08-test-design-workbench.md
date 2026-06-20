# Test Design Workbench Spec

## Purpose

Test Design Workbench は、構造化された仕様情報からテスト観点を作るための補助機能である。

この機能はAIによる自由生成ではなく、テスト技法に基づいて候補を作り、利用者が採用・編集・却下することを前提にする。

## Phase position

- P0では、手動作成したTestViewpointにtechniqueを設定できる状態を作る。
- P1では、変更履歴やTraceLinkと組み合わせて観点の根拠を辿れる状態にする。
- P2では、構造化されたDataType、BusinessRule、State、Flow、DecisionTableなどからViewpointCandidateを生成する。

P0/P1ではViewpointCandidateの永続化は必須ではない。P2で候補レビュー履歴を残す必要が出た場合に、`viewpointCandidates` tableを追加する。

## Supported techniques

初期から長期的に扱う技法は次の通り。

```text
同値分割
境界値分析
状態遷移テスト
デシジョンテーブル
ユースケーステスト
探索的テスト観点
```

初期実装では、すべてを自動生成する必要はない。まずは手動作成したTestViewpointにtechniqueを設定できる状態を作り、後続で候補生成を追加する。

## Workbench workflow

基本フロー:

1. 対象Featureを選択する。
2. 対象となるDataType、BusinessRule、State、Flow、UiNode、OpenQuestionを選択する。
3. 適用する技法を選択する。
4. 候補Viewpointを生成する。
5. 利用者が候補を確認する。
6. 採用した候補をTestViewpointとして保存する。
7. 元要素とのTraceLinkを作成する。

## Candidate model

```ts
type ViewpointCandidate = {
  id: string;
  projectId: string;
  featureId: string;
  title: string;
  description?: string;
  technique:
    | 'equivalence'
    | 'boundary'
    | 'state-transition'
    | 'decision-table'
    | 'use-case'
    | 'exploratory';
  sourceType: TraceNodeType;
  sourceId: string;
  suggestedPriority?: Priority;
  suggestedAutomationSuitability?: AutomationSuitability;
  suggestedAutomationReason?: string;
  status: 'candidate' | 'accepted' | 'rejected' | 'ignored';
};
```

P2で永続化する場合は、`ViewpointCandidate` も `EntityBase` 相当のcreatedAt / updatedAt / statusを持つ形へ拡張してよい。ただし、採用後の正本は `TestViewpoint` であり、Candidateはレビュー履歴または一時候補として扱う。

## Equivalence partitioning

DataTypeの制約とvalid/invalid examplesから観点候補を作る。

### Input

- DataType.baseType
- constraints
- validExamples
- invalidExamples

### Candidate rules

```text
validExamplesがある
→ 有効同値クラスの観点候補を作る

invalidExamplesがある
→ 無効同値クラスの観点候補を作る

required=true
→ 未入力・空値の観点候補を作る

patternがある
→ パターン一致・不一致の観点候補を作る
```

## Boundary value analysis

DataTypeのmin/max/minLength/maxLengthから境界値観点を作る。

### Candidate rules

```text
minLength = N
→ N-1, N, N+1 の観点候補

maxLength = N
→ N-1, N, N+1 の観点候補

min = N
→ N-1, N, N+1 の観点候補

max = N
→ N-1, N, N+1 の観点候補
```

負の値や文字数0など、対象DataType上無効な候補は生成前または生成後レビューで除外する。

## State transition testing

状態と状態遷移から観点候補を作る。

P0ではState / StateTransitionはReserved modelであり、専用UIやRepositoryは実装しない。Phase 8以降でState / StateTransitionの構造が安定してから扱う。

### Candidate rules

```text
valid transition
→ 正常遷移の観点候補

invalid transition
→ 不正遷移の観点候補

terminal state
→ 完了後に変更できない観点候補
```

## Decision table

BusinessRuleの条件と結果からデシジョンテーブル観点を作る。

P0では、構造化されたDecisionTableモデルは必須にしない。BusinessRuleから手動で観点を作る導線を優先する。

Domain Modelと合わせる将来モデル:

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

`conditions` と `actions` は列定義、`rules` は各組み合わせ行を表す。`Record<string, string>` のkeyは列名または列IDとし、値は `Y` / `N` / `-` に限定しない。現実の業務条件では数値、区分、状態名を保持する必要があるためである。

## Use-case testing

Feature、Screen、UiNode、BusinessRule、Flowから業務フロー観点を作る。

### Candidate examples

- 正常完了フロー
- 入力途中離脱
- 戻る操作
- 保存前キャンセル
- 権限不足時の動作
- 外部連携失敗時の動作

Flow / FlowStepが未実装のPhaseでは、Featureのpurpose、preconditions、successCriteria、failureConditionsやBusinessRuleから手動で観点を作る。

## OpenQuestion-based viewpoints

OpenQuestionは、未確定情報に基づく観点を明示するために使う。

Candidate examples:

- 未確認仕様がconfirmedになった場合に再確認が必要な観点
- assumed/unknownのまま作成された暫定観点
- 回答待ちの仕様がTestCaseの期待結果に影響する観点

OpenQuestionからTestViewpointを作る場合は、`TestViewpoint derived_from OpenQuestion` のTraceLinkを作成する。

## Candidate review

生成候補は自動でTestViewpointへ確定しない。

利用者は次を選べる。

- accept: TestViewpointとして保存する。
- edit and accept: 編集して保存する。
- reject: 不採用として残す。
- ignore: 今回は無視する。

候補を採用するときは、次をTestViewpointへ引き継ぐ。

- title
- description
- technique
- suggestedPriority
- suggestedAutomationSuitability
- suggestedAutomationReason

## TraceLink integration

候補をTestViewpointとして保存するとき、元要素とのTraceLinkを自動作成する。

例:

```text
TestViewpoint derived_from DataType
TestViewpoint derived_from BusinessRule
TestViewpoint derived_from UiNode
TestViewpoint derived_from OpenQuestion
```

Allowed TraceLink matrixは `docs/specs/06-traceability-spec.md` を正とする。

## Automation suitability

Workbenchは、automationSuitabilityの初期値と理由も提案できる。

基本ルール:

- 決定論的でDOM操作だけで確認できる: high
- データ準備が必要だが安定している: medium
- 外部連携、タイミング依存、視覚確認が強い: low
- 人間判断が必要: manual-only

`suggestedAutomationReason` には、なぜその判定にしたのかを短く保持する。採用時は `TestViewpoint.automationReason` に引き継ぐ。

## Non-goals

初期実装では次を行わない。

- AIによる自由な観点大量生成
- 生成候補の自動採用
- テストケースまでの完全自動生成
- すべてのテスト技法の完全実装
- 組み合わせ爆発を自動で最適化する高度なアルゴリズム
- P0/P1でViewpointCandidateを必須永続化すること
