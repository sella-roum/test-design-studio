# Project Dashboard UI Spec

## Purpose

Project Dashboard / Project Listは、Test Design Studioにおける入口画面である。

ただし、この画面はプロダクト価値の中心ではない。P0では、高度な分析Dashboardではなく、Projectを作成し、対象Projectを選び、Feature Workspaceへ進むための実務的な導線を優先する。

## Scope

この文書では次を扱う。

- Top-level Dashboard
- Project List
- Project Detail / Project Dashboard
- Project作成・編集導線
- Empty state
- KPI表示

## Non-goals

P0では次を扱わない。

- 高度なグラフDashboard
- Project横断の詳細分析
- チーム別の作業状況
- 通知
- 権限別表示
- JSON import実装

JSON importはPhase 4 / TASK-018を正とする。

## Top-level Dashboard

### Purpose

ユーザーが最初に開く画面として、現在存在するProjectと全体サマリを表示する。

### Layout

```text
┌────────────────────────────────────────────┐
│ PageHeader                                  │
├────────────────────────────────────────────┤
│ KPI Cards                                   │
├────────────────────────────────────────────┤
│ Project Table                               │
└────────────────────────────────────────────┘
```

### KPI cards

| KPI                   | 内容                                    |   P0 |
| --------------------- | --------------------------------------- | ---: |
| Projects              | activeなProject数                       | 必須 |
| Features              | activeなFeature数                       | 必須 |
| Test Viewpoints       | activeなTestViewpoint数                 | 必須 |
| Test Cases            | activeなTestCase数                      | 必須 |
| Open Questions        | `questionStatus: open` の件数           | 必須 |
| Automation Candidates | automationSuitabilityがhighのTestCase数 | 任意 |

### KPI calculation policy

- `status: removed` は集計対象外にする。
- `deprecated` は原則として集計に含めるが、UI上はdeprecatedであることが分かるようにする。
- P0では月次増減表示は不要。

## Project Table

### Columns

| カラム         | 内容                          |   P0 |
| -------------- | ----------------------------- | ---: |
| Project name   | Project.name                  | 必須 |
| Description    | Project.description           | 必須 |
| Features       | Feature count                 | 必須 |
| Viewpoints     | TestViewpoint count           | 必須 |
| Test cases     | TestCase count                | 必須 |
| Open questions | open OpenQuestion count       | 必須 |
| Updated at     | Project.updatedAt             | 必須 |
| Status         | active / deprecated / removed | 必須 |
| Actions        | open / edit / remove          | 必須 |

### Row action

Project名または行クリックでProject Detailへ遷移する。

Actions menuでは最低限次を提供する。

- 開く
- 編集
- 論理削除

P0では物理削除を提供しない。

## Project create dialog

### Fields

| フィールド    | 必須 | 内容          |
| ------------- | ---: | ------------- |
| name          | 必須 | Project名     |
| description   | 任意 | 説明          |
| targetAppName | 任意 | 対象アプリ名  |
| targetAppUrl  | 任意 | 対象アプリURL |
| status        | 任意 | 初期値active  |

Project作成・編集フォームの保存フィールド名はDomain Modelの `Project` を正とする。`targetUrl` のようなUI独自の保存フィールドは使わない。

### Behavior

- nameのみで作成できる。
- 作成後はProject Detailへ遷移する。
- 作成失敗時はdialogを閉じずにエラーを表示する。

## Project Detail / Project Dashboard

### Purpose

1つのProjectに属するFeature一覧と設計状況を確認し、Feature Workspaceへ進む。

### Layout

```text
┌────────────────────────────────────────────┐
│ Project Header                              │
├────────────────────────────────────────────┤
│ Project Summary Cards                       │
├────────────────────────────────────────────┤
│ Feature List                                │
└────────────────────────────────────────────┘
```

### Project Header

表示項目:

- Project name
- Description
- StatusBadge
- UpdatedAt
- Primary action: Feature作成
- Secondary action: Export
- Secondary action: Project編集

Exportの実処理はPhase 4を正とする。Phase 3ではExport画面への導線または準備中表示でよい。

### Project Summary Cards

| 項目           | 内容                |
| -------------- | ------------------- |
| Features       | Feature数           |
| Screens        | Screen数            |
| UI Nodes       | UiNode数            |
| Data Types     | DataType数          |
| Business Rules | BusinessRule数      |
| Viewpoints     | TestViewpoint数     |
| Test Cases     | TestCase数          |
| Open Questions | open OpenQuestion数 |

P0では4枚程度に絞ってもよい。

推奨P0表示:

- Features
- Screens / UI Nodes
- Viewpoints / Test Cases
- Open Questions

## Feature List

### Columns

| カラム         | 内容                 |   P0 |
| -------------- | -------------------- | ---: |
| Feature name   | Feature.name         | 必須 |
| Description    | Feature.description  | 必須 |
| Screens        | 関連Screen数         | 必須 |
| UI Nodes       | 関連UiNode数         | 必須 |
| Viewpoints     | TestViewpoint数      | 必須 |
| Test cases     | TestCase数           | 必須 |
| Open questions | open OpenQuestion数  | 必須 |
| Status         | Feature.status       | 必須 |
| Updated at     | Feature.updatedAt    | 必須 |
| Actions        | open / edit / remove | 必須 |

### Feature create behavior

- Project DetailのPrimary actionからFeatureを作成する。
- nameだけで作成可能にする。
- 作成後はFeature Workspaceへ遷移する。

## Empty states

### No project

```text
まだプロジェクトがありません

最初のテスト設計プロジェクトを作成して、
機能・画面・テスト観点・テストケースを整理しましょう。

[プロジェクトを作成]
```

### No feature

```text
まだ機能がありません

このProjectで最初に設計したい機能を作成しましょう。
Feature Workspaceで画面、UI要素、業務ルール、観点、ケースを整理できます。

[機能を作成]
```

## Error states

| 状態                  | 表示                                                     |
| --------------------- | -------------------------------------------------------- |
| Project load failed   | Project一覧の取得に失敗しました。再試行ボタンを表示する  |
| Project not found     | Projectが見つかりません。Project一覧へ戻る導線を表示する |
| Feature create failed | 作成フォーム内にエラーを表示する                         |
| Remove failed         | Toastと対象行のエラー表示を併用する                      |

## Acceptance criteria

- Projectを作成できる。
- 作成したProjectが一覧に表示される。
- Projectを選択してProject Detailへ遷移できる。
- Project DetailでFeatureを作成できる。
- Featureを選択してFeature Workspaceへ遷移できる。
- Project / Featureの空状態が分かりやすい。
- `status: removed` は通常一覧に表示されない。
- 再読み込み後もProject / Featureが保持される。
