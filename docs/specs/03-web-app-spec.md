# Web App Spec

## Purpose

Webアプリ本体は、Test Design Studio の中心となる編集ワークスペースである。Chrome拡張は入力補助として扱い、正本データの確認・編集・出力はWebアプリ側で行う。

## Primary workflow

初期実装で重視する利用フローは次の通り。

1. Projectを作成する。
2. Featureを作成する。
3. Featureに関連するScreenを登録する。
4. Screenに主要UiNodeを登録する。
5. DataTypeやBusinessRuleを登録する。
6. TestViewpointを作成する。
7. TestCaseを作成する。
8. TraceLinkで仕様要素と観点・ケースを紐づける。
9. ChangeRecordを登録する。
10. Markdown / JSON として出力する。

## Route structure

初期実装では、管理画面を細かく分けすぎず、Feature Workspace を中心にする。

```text
/
/projects
/projects/:projectId
/projects/:projectId/features/:featureId
/projects/:projectId/export
/settings
```

## Project list

### Purpose

作成済みProjectを一覧し、新規作成・選択できる。

### Requirements

- Project一覧を更新日時順で表示する。
- Projectを作成できる。
- Project名と説明を編集できる。
- Projectを論理削除できる。
- JSON importからProjectを作成できる。

## Project dashboard

### Purpose

Project配下のFeature、最近の変更、未確認事項、出力導線を表示する。

### Requirements

- Feature一覧を表示する。
- Featureを作成できる。
- 最近更新されたFeatureを表示する。
- ChangeRecordの直近一覧を表示する。
- Export画面へ遷移できる。

## Feature Workspace

Feature Workspace は、1機能分の仕様把握とテスト設計を進める主要画面である。

### Sections

```text
Overview
Screens / UI Tree
Data / Rules
Viewpoints
Test Cases
Changes
Traceability
Export Preview
```

### Layout principle

初期実装では、次の構成を推奨する。

- 左: セクションナビゲーション
- 中央: 選択中セクションの編集領域
- 右: 関連情報、未確認事項、TraceLink、ChangeRecord

MVPでは右ペインを簡略化してもよいが、将来的に拡張できる構成にする。

## Overview section

Featureの基本情報を編集する。

- name
- description
- priority
- riskLevel
- status

## Screens / UI Tree section

Featureに関連するScreenとUiNodeを登録する。

### Screen requirements

- Screenを追加・編集・論理削除できる。
- Screen名、URL pattern、説明を保持できる。

### UiNode requirements

- Screen単位でUiNodeを追加できる。
- UiNodeをツリー構造で表示できる。
- parentIdとsortOrderで並び順を制御する。
- name、role、componentType、selectorHint、required、visibleConditionを編集できる。
- DOMキャプチャ由来の候補を手動確認して取り込める。

初期実装ではドラッグ&ドロップ並び替えは必須にしない。上下移動ボタンまたはsortOrder編集でよい。

## Data / Rules section

DataType、DataEntity、DataField、BusinessRuleを登録する。

初期実装では、DataEntity/DataFieldを簡略化し、DataTypeとBusinessRuleを優先してもよい。

### DataType requirements

- name、baseType、constraints、validExamples、invalidExamplesを編集できる。
- required、minLength、maxLength、min、max、pattern、enumValuesを扱える。

### BusinessRule requirements

- name、description、ruleType、confidenceを編集できる。
- Feature、Screen、UiNodeに紐づけられる。

## Viewpoints section

TestViewpointを登録する。

### Requirements

- title、description、technique、priority、automationSuitabilityを編集できる。
- UiNode、DataType、BusinessRuleなどとTraceLinkで紐づけられる。
- 将来的な技法ワークベンチからの生成候補を受け入れられる。

## Test Cases section

TestCaseを登録する。

### Requirements

- title、preconditions、steps、expectedResult、testData、priority、automationSuitabilityを編集できる。
- TestViewpointに紐づけられる。
- Markdown exportに出力できる。

## Changes section

ChangeRecordを登録・確認する。

### Requirements

- targetType、targetId、changeType、summary、before、after、reason、confidenceを編集できる。
- 変更対象に関連するTraceLinkを表示できる。
- 影響候補の自動提示はPhase 7以降で実装する。

## Traceability section

TraceLinkを確認する。

### Requirements

- 仕様要素から観点・ケースへのリンクを表示する。
- TestViewpointから元仕様を辿れる。
- TestCaseから元観点を辿れる。

初期実装では一覧表示でよく、高度なグラフ表示は必須にしない。

## Validation

入力バリデーションは、最低限次を扱う。

- name/title は空にしない。
- projectId/featureId/screenIdなどの必須参照を持たせる。
- stepsは空配列にしない。
- statusは定義済み値に限定する。

## UX principles

- すべてを最初から入力させない。
- 最小情報で作成し、後から詳細化できるようにする。
- 未入力項目をエラー扱いしすぎない。
- 仕様の確度が低いものは `confidence` で表現する。
- 削除ではなく非推奨化・論理削除を基本にする。

## Non-goals

初期Webアプリでは次を実装しない。

- 複数ユーザー同時編集
- 認証
- クラウド同期
- 高度なダッシュボード
- グラフ型トレーサビリティ表示
- AI生成
- Playwrightコード生成
