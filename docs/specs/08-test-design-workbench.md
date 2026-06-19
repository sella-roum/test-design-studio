# Test Design Workbench Spec

## Purpose

Test Design Workbench は、構造化された仕様情報からテスト観点を作るための補助機能である。

この機能はAIによる自由生成ではなく、テスト技法に基づいて候補を作り、利用者が採用・編集・却下することを前提にする。

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
2. 対象となるDataType、BusinessRule、State、Flow、UiNodeを選択する。
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
  technique: "equivalence" | "boundary" | "state-transition" | "decision-table" | "use-case" | "exploratory";
  sourceType: string;
  sourceId: string;
  suggestedPriority?: "high" | "medium" | "low";
  suggestedAutomationSuitability?: "high" | "medium" | "low" | "manual-only";
  status: "candidate" | "accepted" | "rejected";
};
```

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

初期実装ではStateモデルが未実装の場合、後続フェーズで扱う。

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

初期実装では、構造化されたDecisionTableモデルは必須にしない。BusinessRuleから手動で観点を作る導線を優先する。

将来的なモデル:

```ts
type DecisionTable = {
  id: string;
  projectId: string;
  businessRuleId: string;
  conditions: string[];
  actions: string[];
  rules: Array<{
    conditionValues: Array<"Y" | "N" | "-">;
    actionValues: Array<"Y" | "N">;
  }>;
};
```

## Use-case testing

Feature、Screen、UiNode、BusinessRuleから業務フロー観点を作る。

### Candidate examples

- 正常完了フロー
- 入力途中離脱
- 戻る操作
- 保存前キャンセル
- 権限不足時の動作
- 外部連携失敗時の動作

## Candidate review

生成候補は自動でTestViewpointへ確定しない。

利用者は次を選べる。

- accept: TestViewpointとして保存する。
- edit and accept: 編集して保存する。
- reject: 不採用として残す。
- ignore: 今回は無視する。

## TraceLink integration

候補をTestViewpointとして保存するとき、元要素とのTraceLinkを自動作成する。

例:

```text
TestViewpoint derived_from DataType
TestViewpoint derived_from BusinessRule
TestViewpoint derived_from UiNode
```

## Automation suitability

Workbenchは、automationSuitabilityの初期値も提案できる。

基本ルール:

- 決定論的でDOM操作だけで確認できる: high
- データ準備が必要だが安定している: medium
- 外部連携、タイミング依存、視覚確認が強い: low
- 人間判断が必要: manual-only

## Non-goals

初期実装では次を行わない。

- AIによる自由な観点大量生成
- 生成候補の自動採用
- テストケースまでの完全自動生成
- すべてのテスト技法の完全実装
- 組み合わせ爆発を自動で最適化する高度なアルゴリズム
