# Web App Spec

## Purpose

Webアプリ本体は、Test Design Studio の中心となる編集ワークスペースである。Chrome拡張は入力補助として扱い、正本データの確認・編集・出力はWebアプリ側で行う。

## Target end-to-end workflow

プロダクトとして最終的に重視する利用フローは次の通り。

1. Projectを作成する。
2. Featureを作成する。
3. Featureに関連するScreenを登録する。
4. Screenに主要UiNodeを登録する。
5. DataTypeやBusinessRuleを登録する。
6. 未確認事項をOpenQuestionとして明示する。
7. TestViewpointを作成する。
8. TestCaseを作成する。
9. TraceLinkで仕様要素と観点・ケースを紐づける。
10. ChangeRecordを登録する。
11. Markdown / JSON として出力する。

## Phase 3 initial workflow

Phase 3 の初期Webアプリ実装では、P0のWeb Design MVPとして次の手入力フローを対象にする。

1. Projectを作成・選択する。
2. Featureを作成する。
3. Screenを登録する。
4. Screenに主要UiNodeを手入力する。
5. DataTypeやBusinessRuleを手入力する。
6. OpenQuestionを登録する。
7. TestViewpointを作成する。
8. TestCaseを作成する。

TraceLinkはP0でも保存モデルとして存在するが、専用の高度なTraceability UIはPhase 7で扱う。P0では、TestCase作成時のViewpoint紐づけ、またはTestViewpoint作成時の簡易的なsource element紐づけに留める。

Export / ImportはPhase 4を正とする。Chrome拡張はPhase 5-6を正とする。ChangeRecord UI / TraceLink UI / 影響候補表示はPhase 7を正とする。

## Route structure

初期実装では、管理画面を細かく分けすぎず、Feature Workspace を中心にする。

```text
/
/projects
/projects/:projectId
/projects/:projectId/features/:featureId
/projects/:projectId/export
```

`/settings` はP0では必須にしない。テーマ、最後に開いたProject IDなどの軽量設定が必要になった場合は、専用タスクを追加してから実装する。

## Project list

### Purpose

作成済みProjectを一覧し、新規作成・選択できる。

### Requirements

- Project一覧を更新日時順で表示する。
- Projectを作成できる。
- Project名と説明を編集できる。
- Projectを論理削除できる。
- JSON importからProjectを作成する機能はPhase 4 / TASK-018で扱う。
- Phase 3ではJSON import UIを実装しない。必要な場合は準備中表示に留める。

## Project dashboard

### Purpose

Project配下のFeature、未確認事項、出力導線を表示する。

### Requirements

- Feature一覧を表示する。
- Featureを作成できる。
- 最近更新されたFeatureを表示する。
- OpenQuestionの件数を表示できる。
- ChangeRecordの直近一覧はPhase 7以降で表示する。
- Export画面へ遷移できる。ただし、Export / Import機能の実装はPhase 4を正とする。

## Feature Workspace

Feature Workspace は、1機能分の仕様把握とテスト設計を進める主要画面である。

### Sections

```text
Overview
Screens / UI Tree
Data / Rules
Open Questions
Viewpoints
Test Cases
Changes
Traceability
Export Preview
```

Phase 3では `Overview`、`Screens / UI Tree`、`Data / Rules`、`Open Questions`、`Viewpoints`、`Test Cases` を優先する。`Changes`、`Traceability`、`Export Preview` は枠だけ用意してもよいが、実装判断はそれぞれ Phase 7、Phase 7、Phase 4 のタスクを優先する。

### Layout principle

初期実装では、次の構成を推奨する。

- 左: セクションナビゲーション
- 中央: 選択中セクションの編集領域
- 右: 関連情報、未確認事項、TraceLink、ChangeRecord

P0では右ペインを簡略化してもよい。OpenQuestionの件数や関連項目の簡易表示に留め、TraceLink / ChangeRecordの本格編集はPhase 7で実装する。

## Overview section

Featureの基本情報を編集する。

- name
- description
- purpose
- actor
- preconditions
- successCriteria
- failureConditions
- priority
- riskLevel
- confidence
- status

P0ではすべてを必須入力にしない。`name` だけで作成し、後から詳細化できるようにする。

## Screens / UI Tree section

Featureに関連するScreenとUiNodeを登録する。

### Screen requirements

- Screenを追加・編集・論理削除できる。
- Screen名、screenType、URL pattern、purpose、preconditions、説明、confidenceを保持できる。

### UiNode requirements

- Screen単位でUiNodeを追加できる。
- UiNodeをツリー構造で表示できる。
- parentIdとsortOrderで並び順を制御する。
- name、role、componentType、selectorHint、textHint、required、visibleConditionを編集できる。
- DOMキャプチャ由来の候補を手動確認して取り込める。ただし、実際のDomCaptureCandidate連携はPhase 6以降で扱う。

初期実装ではドラッグ&ドロップ並び替えは必須にしない。上下移動ボタンまたはsortOrder編集でよい。

`label` フィールドは使わず、表示ラベル相当の情報は `name` または `textHint` で扱う。

## Data / Rules section

DataType、DataEntity、DataField、BusinessRuleを登録する。

初期実装では、DataEntity/DataFieldを簡略化し、DataTypeとBusinessRuleを優先してもよい。

### DataType requirements

- name、baseType、constraints、validExamples、invalidExamplesを編集できる。
- required、minLength、maxLength、min、max、pattern、enumValuesを扱える。

### BusinessRule requirements

- name、description、ruleType、confidenceを編集できる。
- Feature、Screen、UiNodeに紐づけられる。
- エラー・例外はP0では `ruleType: "error" | "exception"` で表現してよい。

## Open Questions section

OpenQuestionを登録し、未確認仕様を確定仕様と分けて管理する。

### Requirements

- question、context、answer、questionStatus、confidenceを編集できる。
- Feature、Screen、UiNode、またはP0 UI-selectable TraceNodeTypeに対応する対象へ紐づけられる。
- `questionStatus: "open"` の件数をProject dashboardやFeature Workspaceで確認できる。
- Markdown exportに出力できる。ただし、Markdown export機能の実装はPhase 4を正とする。

## Viewpoints section

TestViewpointを登録する。

### Requirements

- title、description、technique、priority、automationSuitability、automationReasonを編集できる。
- UiNode、DataType、BusinessRule、OpenQuestionなどとTraceLinkで紐づけられる。
- P0ではTraceLink作成UIを簡略化し、TestViewpoint作成時のsource element選択に留める。
- 将来的な技法ワークベンチからの生成候補を受け入れられる。

TraceLinkの本格作成UI自体はPhase 7で実装する。

## Test Cases section

TestCaseを登録する。

### Requirements

- title、preconditions、steps、expectedResult、testData、priority、automationSuitability、automationReasonを編集できる。
- stepsは内部的に `TestStep[]` として保存する。
- P0のUIでは、簡易的な複数行入力からTestStepへ変換してもよい。
- TestViewpointに紐づけられる。
- Markdown exportに出力できる。ただし、Markdown export機能の実装はPhase 4を正とする。

## Changes section

ChangeRecordを登録・確認する。実装判断は `docs/specs/07-change-management-spec.md` と Phase 7 タスクを優先する。

### Requirements

- targetType、targetId、changeType、summary、before、after、reason、confidenceを編集できる。
- 変更対象に関連するTraceLinkを表示できる。
- 影響候補の自動提示はPhase 7以降で実装する。

P0ではChangeRecordの保存モデルを用意してよいが、このセクションの編集UIは実装しない。Phase 3で表示する場合は準備中表示に留める。

## Traceability section

TraceLinkを確認する。実装判断は `docs/specs/06-traceability-spec.md` と Phase 7 タスクを優先する。

### Requirements

- 仕様要素から観点・ケースへのリンクを表示する。
- TestViewpointから元仕様を辿れる。
- TestCaseから元観点を辿れる。
- OpenQuestionが観点やケースに利用されている場合、未確認状態が分かる。

P0では、TestViewpointとsource element、TestCaseとTestViewpointの関係を確認できる最小表示に留める。高度なグラフ表示や任意TraceLink編集UIはPhase 7で扱う。

## Validation

入力バリデーションは、最低限次を扱う。

- name/title/question は空にしない。
- projectId/featureId/screenIdなどの必須参照を持たせる。
- TestCase.stepsは空配列にしない。
- TestStep.instructionは空にしない。
- statusは定義済み値に限定する。
- OpenQuestion.questionStatusは定義済み値に限定する。

## UX principles

- すべてを最初から入力させない。
- 最小情報で作成し、後から詳細化できるようにする。
- 未入力項目をエラー扱いしすぎない。
- 仕様の確度が低いものは `confidence` で表現する。
- 未確認仕様はOpenQuestionとして確定仕様と分ける。
- 削除ではなく非推奨化・論理削除を基本にする。

## Non-goals

P0のWebアプリでは次を実装しない。

- 複数ユーザー同時編集
- 認証
- クラウド同期
- 高度なダッシュボード
- グラフ型トレーサビリティ表示
- 任意TraceLink編集UI
- ChangeRecord編集UI
- JSON import UI
- AI生成
- Playwrightコード生成