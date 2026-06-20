# Test Design Editor UI Spec

## Purpose

この文書は、TestViewpoint Editor、TestCase Editor、StepTableのUI仕様を定義する。

TestViewpointとTestCaseは密接に関連するが、同じ編集画面に詰め込みすぎると責務が曖昧になる。P0では、それぞれを分けて扱い、相互リンクできる構造にする。

## Design policy

### Separate Viewpoint and TestCase responsibilities

- TestViewpointは「何を確認すべきか」を管理する。
- TestCaseは「どの手順で確認するか」を管理する。
- TestCaseは必ずTestViewpointに紐づける。
- TestViewpointから関連TestCaseを作成できる導線を持つ。

### Keep source relationship visible

TestViewpointは、UiNode、DataType、BusinessRule、OpenQuestionなどのsource elementから生まれる。

P0では高度なTraceLink編集UIを作らず、TestViewpoint作成時にsource elementを簡易選択して `derived_from` TraceLinkを作成する。

## Viewpoints tab

### Layout

```text
┌────────────────────────────────────────────┐
│ Toolbar / Filter / Create action            │
├────────────────────────────────────────────┤
│ Viewpoint Table                             │
└────────────────────────────────────────────┘
```

### Table columns

| Column | 内容 | P0 |
|---|---|---:|
| ID | VP-001など | 任意 |
| Title | 観点タイトル | 必須 |
| Technique | equivalence / boundary / decision tableなど | 必須 |
| Priority | high / medium / low | 必須 |
| Risk | high / medium / low | 任意 |
| Source | 関連source element | 必須 |
| Test cases | 関連TestCase数 | 必須 |
| Automation suitability | high / medium / low / unknown | 必須 |
| Status | active / deprecated / removed | 必須 |
| Actions | edit / create test case / remove | 必須 |

## Viewpoint Editor

### Purpose

テスト観点を構造化して作成・編集する。

### Recommended layout

```text
┌──────────────────────────────┬──────────────────────┐
│ Viewpoint form                │ Related information   │
├──────────────────────────────┼──────────────────────┤
│ Related test cases            │ Source links          │
└──────────────────────────────┴──────────────────────┘
```

P0では右ペインを簡略化してよい。

### Fields

| Field | 必須 | 内容 |
|---|---:|---|
| title | 必須 | 観点タイトル |
| description | 任意 | 観点の説明 |
| technique | 必須 | テスト技法 |
| priority | 任意 | 優先度 |
| riskLevel | 任意 | リスク |
| automationSuitability | 任意 | 自動化適性 |
| automationReason | 任意 | 自動化適性の理由 |
| sourceElements | 任意 | UiNode / DataType / BusinessRule / OpenQuestionなど |
| tags | 任意 | 検索・分類用 |
| status | 必須 | activeなど |

### Technique options

| Value | 表示名 |
|---|---|
| functional | 機能 |
| validation | 入力検証 |
| permission | 権限 |
| state | 状態 |
| transition | 遷移 |
| error | エラー |
| boundary | 境界値 |
| equivalence | 同値分割 |
| decision_table | デシジョンテーブル |
| usability | 操作性 |
| integration | 連携 |
| other | その他 |

P0では既存Domain Modelで定義済みの値を正とし、UI側で勝手にenumを増やさない。
未定義の値が必要な場合はDomain Modelの更新タスクを先に作る。

### Source element picker

P0のsource element pickerは簡易でよい。

#### 対象

- Screen
- UiNode
- DataType
- DataEntity
- DataField
- BusinessRule
- OpenQuestion

#### Behavior

- 複数選択可能。
- 選択時に `derived_from` TraceLinkを作成できる構造にする。
- 既存TraceLinkの本格編集はPhase 7に回す。

## Test Cases tab

### Layout

```text
┌────────────────────────────────────────────┐
│ Toolbar / Filter / Create action            │
├────────────────────────────────────────────┤
│ TestCase Table                              │
└────────────────────────────────────────────┘
```

### Table columns

| Column | 内容 | P0 |
|---|---|---:|
| ID | TC-001など | 任意 |
| Title | ケースタイトル | 必須 |
| Related viewpoint | 紐づくTestViewpoint | 必須 |
| Priority | high / medium / low | 必須 |
| Step count | TestStep数 | 必須 |
| Automation suitability | high / medium / low / unknown | 必須 |
| Status | draft / active / deprecated / removed | 必須 |
| Actions | edit / duplicate / remove | 必須 |

## TestCase Editor

### Purpose

TestViewpointに紐づく、実行可能なテストケースを作成・編集する。

### Recommended layout

```text
┌──────────────────────────────┬──────────────────────┐
│ TestCase form                 │ Related information   │
├──────────────────────────────┴──────────────────────┤
│ StepTable                                             │
└──────────────────────────────────────────────────────┘
```

### Fields

| Field | 必須 | 内容 |
|---|---:|---|
| title | 必須 | ケースタイトル |
| viewpointId | 必須 | 関連TestViewpoint |
| purpose | 任意 | 目的 |
| preconditions | 任意 | 前提条件 |
| testData | 任意 | テストデータ |
| priority | 任意 | 優先度 |
| automationSuitability | 任意 | 自動化適性 |
| automationReason | 任意 | 自動化適性の理由 |
| steps | 必須 | TestStep[] |
| expectedResult | 任意 | ケース全体の期待結果。詳細は各stepで扱う |
| status | 必須 | activeなど |

## StepTable

### Purpose

TestCaseの手順を、将来のPlaywright draft exportに耐える構造で入力する。

P0でも内部保存は `TestStep[]` とする。

### Columns

| Column | 内容 | P0 |
|---|---|---:|
| Step | order | 必須 |
| Action | action種別または短い操作名 | 必須 |
| Instruction | 実際の操作説明 | 必須 |
| Expected Result | 期待結果 | 必須 |
| Target UI | targetUiNodeId | 任意 |
| Test Data | 使用データ | 任意 |
| Note | 補足 | 任意 |
| Actions | add / remove / move | 必須 |

P0の最小表示は次でよい。

- Step
- Action / Instruction
- Expected Result
- Target UI

### Step actions

P0で必要な操作:

- Stepを追加する。
- Stepを削除する。
- Stepを上へ移動する。
- Stepを下へ移動する。
- Target UIをUiNodeから選択する。

ドラッグ&ドロップはP0では必須ではない。

### Validation

| 対象 | 条件 |
|---|---|
| TestCase.title | 空にしない |
| TestCase.viewpointId | 空にしない |
| TestCase.steps | 空配列にしない |
| TestStep.instruction | 空にしない |
| TestStep.expectedResult | P0では推奨。必須にするかは実装タスクで判断 |
| TestStep.order | 重複しない |

## Automation suitability

| Value | 表示名 | 意味 |
|---|---|---|
| high | 高 | Playwright自動化しやすい |
| medium | 中 | 条件付きで自動化できる |
| low | 低 | 手動確認向き |
| unknown | 未判断 | まだ判断していない |

### UI display

- high: success系Badge
- medium: warning系Badge
- low: mutedまたはdanger-soft系Badge
- unknown: neutral Badge

## Related information panel

Editorの右ペインには、次を表示できるとよい。

### Viewpoint Editor

- 関連BusinessRule
- 関連OpenQuestion
- 関連UiNode
- 関連TestCase

### TestCase Editor

- 関連TestViewpoint
- 関連BusinessRule
- 関連OpenQuestion
- 関連UiNode
- 自動化適性の判断メモ

P0では表示のみでよい。高度な編集はPhase 7以降に分離する。

## Empty states

### No viewpoints

```text
まだテスト観点がありません

画面、UI要素、業務ルール、未確認事項をもとに、
この機能で確認すべき観点を作成しましょう。

[テスト観点を作成]
```

### No test cases

```text
まだテストケースがありません

作成済みのテスト観点から、実行可能なテストケースを作成しましょう。

[テストケースを作成]
```

### No source elements

```text
関連づけできる仕様要素がまだありません

先にScreen、UiNode、DataType、BusinessRule、OpenQuestionを登録すると、
観点の根拠をより明確にできます。
```

## Acceptance criteria

- TestViewpointを作成できる。
- TestViewpointにautomationSuitabilityとautomationReasonを保存できる。
- TestViewpoint作成時にsource elementを選択できる。
- source element選択により、最低限の `derived_from` TraceLinkを保存できる。
- TestCaseを作成できる。
- TestCaseはTestViewpointに紐づく。
- TestCase.stepsは内部的に `TestStep[]` として保存される。
- StepTableでStepの追加、削除、並び替えができる。
- TestStepにinstruction、expectedResult、targetUiNodeIdを保持できる。
- 再読み込み後もViewpoint、TestCase、TestStepが復元される。
