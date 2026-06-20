# Feature Workspace UI Spec

## Purpose

Feature Workspaceは、Test Design Studioの中心画面である。

1つのFeatureに対して、仕様、画面、UI要素、データ、業務ルール、未確認事項、テスト観点、テストケースを一箇所で整理する。

この画面が弱いと、プロダクト全体が単なるテストケース一覧になる。P0/P1のUI設計ではFeature Workspaceを最重要画面として扱う。

## Primary user goals

- 1機能分の仕様情報を整理する。
- 画面とUI要素をテスト設計上の意味単位で管理する。
- データ条件と業務ルールを観点に接続する。
- 未確認事項を確定仕様から分離する。
- TestViewpointとTestCaseを作成する。
- 後続PhaseでTraceabilityを表示できるように、P0から関係データを保存する。

## Route

```text
/projects/:projectId/features/:featureId
```

Tabはquery parameterまたは内部stateで制御する。

```text
/projects/:projectId/features/:featureId?tab=overview
/projects/:projectId/features/:featureId?tab=screens
/projects/:projectId/features/:featureId?tab=viewpoints
```

P0ではURLにtabを反映しなくてもよいが、後続で深いリンクを作れる構造にしておく。

## Layout

```text
┌────────────────────────────────────────────┐
│ Breadcrumb / Feature Header                 │
├────────────────────────────────────────────┤
│ Summary Cards                               │
├────────────────────────────────────────────┤
│ Tabs                                        │
├───────────────┬────────────────────────────┤
│ Left Panel    │ Main Detail Panel           │
└───────────────┴────────────────────────────┘
```

P0では常に3ペインにしなくてもよい。Screens / UI Treeでは左ペインを使い、OverviewやOpen Questionsでは1カラムまたは2カラムでよい。

## Feature Header

### Elements

| 要素          | 内容                          |      P0 |
| ------------- | ----------------------------- | ------: |
| Breadcrumb    | Project > Feature             |    必須 |
| Feature name  | Feature.name                  |    必須 |
| Description   | Feature.description           |    任意 |
| StatusBadge   | active / deprecated / removed |    必須 |
| UpdatedAt     | Feature.updatedAt             |    任意 |
| Edit action   | Feature基本情報編集           |    必須 |
| Export action | Export画面への導線            | Phase 4 |
| More menu     | duplicate / removeなど        |    任意 |

### Example

```text
Projects > Sample Web App > Order Management

Order Management    [active]
注文の作成、確認、更新を扱う機能

[編集] [Export] [...]
```

## Summary Cards

Summary Cardsは、Featureの設計状況を短時間で把握するために表示する。

| Card                  | 内容                                      |            P0 |
| --------------------- | ----------------------------------------- | ------------: |
| Coverage              | TestViewpoint source / TestCase紐づき状況 | Placeholder可 |
| Screens               | 関連Screen数                              |          必須 |
| UI Nodes              | 関連UiNode数                              |          必須 |
| Open Questions        | open / total                              |          必須 |
| Viewpoints            | TestViewpoint数                           |          必須 |
| Test Cases            | TestCase数                                |          必須 |
| Automation Candidates | automationSuitability highの件数          |          任意 |

### P0 coverage definition

P0のCoverageは高度な網羅率として扱わない。

P0では、Traceability専用UIが未実装でも次の関係だけは保存できるようにする。

- TestViewpoint作成時のsource element選択
- TestCase作成時のTestViewpoint紐づけ

Coverage cardは、これらの関係から安全に算出できる段階まではplaceholderにするか非表示にしてよい。

## Tabs

| Tab               | 内容                        |       P0 | 備考                           |
| ----------------- | --------------------------- | -------: | ------------------------------ |
| Overview          | Feature概要                 |     必須 | 基本情報編集                   |
| Screens / UI Tree | Screen / UiNode管理         |     必須 | 手入力から開始                 |
| Data / Rules      | DataType / BusinessRule管理 |     必須 | DataEntity/DataFieldは簡略化可 |
| Open Questions    | 未確認事項管理              |     必須 | 仕様不確実性を明示             |
| Viewpoints        | TestViewpoint管理           |     必須 | source element簡易選択         |
| Test Cases        | TestCase管理                |     必須 | TestStep[]保存                 |
| Traceability      | 関連性確認                  | 準備中可 | 簡易表示もPhase 7を正とする    |
| Changes           | 変更履歴                    |   非対象 | Phase 7                        |
| Export Preview    | 出力確認                    |   非対象 | Phase 4                        |

## Overview tab

### Purpose

Featureの基本情報と設計状況を確認・編集する。

### Fields

| Field             |   P0 | 備考                          |
| ----------------- | ---: | ----------------------------- |
| name              | 必須 | 最小作成項目                  |
| description       | 任意 | 機能概要                      |
| purpose           | 任意 | 機能の目的                    |
| actor             | 任意 | 主利用者                      |
| preconditions     | 任意 | 前提条件                      |
| successCriteria   | 任意 | 成功条件                      |
| failureConditions | 任意 | 失敗条件                      |
| priority          | 任意 | 優先度                        |
| riskLevel         | 任意 | リスク                        |
| confidence        | 任意 | 仕様確度                      |
| status            | 必須 | active / deprecated / removed |

### Layout

```text
┌──────────────────────┬──────────────────────┐
│ Feature Summary       │ Design Status         │
├──────────────────────┼──────────────────────┤
│ Related Screens       │ Open Questions        │
├──────────────────────┴──────────────────────┤
│ Recent Viewpoints / Test Cases               │
└──────────────────────────────────────────────┘
```

P0では、Feature SummaryとRecent Viewpoints / Test Casesだけでもよい。

## Screens / UI Tree tab

### Purpose

ScreenとUiNodeを、テスト設計上意味のある単位で整理する。

DOMやAccessibility Treeの完全コピーではなく、人間が確認したテスト設計用の構造として扱う。

### Layout

```text
┌───────────────┬────────────────────────────┐
│ UI Tree       │ Selected Screen / UiNode     │
└───────────────┴────────────────────────────┘
```

### Left panel

UI Treeを表示する。

```text
Order Management
  └ Order List Screen
      ├ Search Input
      ├ Status Filter
      ├ Order Table
      └ Detail Button
  └ Order Detail Screen
  └ Order Edit Screen
```

### Screen detail fields

| Field                | 内容                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| name                 | 画面名                                                                                                    |
| screenType           | list / detail / create / edit / confirm / complete / error / settings / login / dashboard / admin / other |
| urlPattern           | URL pattern                                                                                               |
| purpose              | 画面の目的                                                                                                |
| preconditions        | 表示前提                                                                                                  |
| description          | 説明                                                                                                      |
| confidence           | 確度                                                                                                      |
| relatedBusinessRules | 関連BusinessRule                                                                                          |
| relatedViewpoints    | 関連TestViewpoint                                                                                         |

`modal` や `drawer` はScreenTypeではなく、必要に応じてUiNodeのcomponentTypeで扱う。

### UiNode detail fields

| Field              | 内容                                        |
| ------------------ | ------------------------------------------- |
| name               | UI要素名                                    |
| role               | button / textbox / linkなど                 |
| componentType      | button / input / select / table / modalなど |
| textHint           | 表示テキスト候補                            |
| accessibleNameHint | accessible name候補                         |
| selectorHint       | selector候補                                |
| locatorStrategy    | locator方針                                 |
| locatorHint        | locator候補                                 |
| required           | 必須入力か                                  |
| visibleCondition   | 表示条件                                    |
| description        | 役割説明                                    |

### P0 actions

- Screenを追加する。
- Screenを編集する。
- UiNodeを追加する。
- UiNodeを編集する。
- UiNodeを親子構造で表示する。
- UiNodeを論理削除する。

### Non-goals

- DOM Capture連携
- Element Picker
- Accessibility Tree Capture
- ドラッグ&ドロップ並び替え
- 差分比較

## Data / Rules tab

### Purpose

入力値、データ型、業務ルールを整理する。

### Layout

```text
┌──────────────────────┬──────────────────────┐
│ Data Types            │ Business Rules        │
└──────────────────────┴──────────────────────┘
```

### DataType table columns

| Column           | 内容                                             |
| ---------------- | ------------------------------------------------ |
| Name             | email / date / amountなど                        |
| Base type        | string / number / boolean / date / enum / object |
| Constraints      | required, min, max, patternなど                  |
| Valid examples   | 正常値例                                         |
| Invalid examples | 異常値例                                         |
| Used by          | 関連UiNode / BusinessRule / Viewpoint            |

P0では `object` の詳細編集UIは必須ではない。ただし、Domain Model上の値として選択・保存できるようにする。

### BusinessRule table columns

| Column             | 内容                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| ID                 | BR-001など                                                                             |
| Name               | ルール名                                                                               |
| Rule type          | validation / permission / display / calculation / workflow / error / exception / other |
| Condition          | 条件                                                                                   |
| Result             | 結果                                                                                   |
| Related UI         | 関連UiNode                                                                             |
| Related Viewpoints | 関連TestViewpoint                                                                      |

画面遷移に関するルールは、現行Domain Modelでは `workflow` または `other` として扱う。`transition` が必要になった場合はDomain Model更新タスクを先に作る。

## Open Questions tab

### Purpose

未確認仕様を確定仕様から分離し、テスト設計上のリスクを見える化する。

### Columns

| Column    | 内容                                         |
| --------- | -------------------------------------------- |
| ID        | Q-001など                                    |
| Question  | 質問内容                                     |
| Context   | 背景                                         |
| Target    | Feature / Screen / UiNode / BusinessRuleなど |
| Priority  | high / medium / low                          |
| Status    | open / answered / deferred / not_applicable  |
| Answer    | 回答                                         |
| UpdatedAt | 更新日時                                     |

### P0 statuses

P0ではDomain Modelに定義済みの次の値を扱う。

- open
- answered
- deferred
- not_applicable

`blocked` が必要になった場合は、UI仕様だけで追加せず、Domain Model更新タスクを先に作る。

## Viewpoints tab

Viewpoints tabの詳細は `05-test-design-editor-ui-spec.md` を参照する。

## Test Cases tab

Test Cases tabの詳細は `05-test-design-editor-ui-spec.md` を参照する。

## Traceability tab

Traceability tabの本格表示はPhase 7を正とする。

P0では、Traceability tabを表示する場合も準備中表示または関連データ不足の説明に留める。

```text
トレーサビリティ表示は後続Phaseで追加します。

P0では、テスト観点作成時のsource element選択と、
テストケース作成時のTestViewpoint紐づけによって、
関連性を保存できる構造を先に整えます。
```

簡易ツリー表示やMatrix UIは `06-export-traceability-ui-spec.md` とPhase 7を正とする。

## Empty states

各Tabでは、空状態にPrimary actionを必ず表示する。

| Tab               | Empty action                        |
| ----------------- | ----------------------------------- |
| Screens / UI Tree | Screenを追加                        |
| Data / Rules      | DataTypeを追加 / BusinessRuleを追加 |
| Open Questions    | 未確認事項を追加                    |
| Viewpoints        | テスト観点を作成                    |
| Test Cases        | テストケースを作成                  |
| Traceability      | Phase 7対象であることを説明         |

## Acceptance criteria

- Feature Workspaceを開ける。
- Feature Headerで現在のFeatureが分かる。
- Summary Cardsで主要件数が分かる。
- Tabsを切り替えられる。
- OverviewでFeature基本情報を確認・編集できる。
- Screens / UI TreeでScreenとUiNodeを手入力できる。
- Data / RulesでDataTypeとBusinessRuleを手入力できる。
- Open Questionsで未確認事項を管理できる。
- ViewpointsとTest Casesへの導線がある。
- P0対象外のTraceability / Changes / Export Previewは準備中表示に留められる。
