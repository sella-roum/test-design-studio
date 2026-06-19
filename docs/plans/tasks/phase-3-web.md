# Phase 3 Web編集フロータスク詳細

この文書は、Phase 3 のWebアプリ編集フローの実装タスクを定義する。

Phase 3では、Webアプリ単体で1機能分の仕様把握、UI構造、データ条件、業務ルール、未確認事項、テスト観点、構造化されたテストケースを手入力できる状態を作る。

## 共通参照

- `docs/specs/00-product-overview.md`
- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- Feature Workspaceを中心導線にする。
- 管理画面を増やしすぎず、1機能の設計を完了させる導線を優先する。
- 画面だけを作って保存できない状態にしない。
- 手入力で正しい構造を保存できることを優先する。
- P0では高度なTraceability UIやChange UIを作らないが、OpenQuestionとTestStepはP0必須モデルとして扱う。

## TASK-011: Project一覧・作成UI

### Goal

Webアプリ上でProjectを作成・一覧表示・選択できるようにする。

### Scope

- Project一覧画面を追加する。
- Project作成フォームを追加する。
- Project論理削除の導線を追加する。
- Project選択後にDashboardへ遷移する。
- 空状態を分かりやすく表示する。

### Non-goals

- Feature編集は実装しない。
- Export / Importは実装しない。
- Chrome拡張は実装しない。
- 認証やユーザー管理は実装しない。

### Acceptance criteria

- Projectを画面から作成できる。
- 作成したProjectが一覧に表示される。
- Projectを選択してDashboardへ遷移できる。
- Projectを論理削除できる。
- 再読み込み後もProjectが残る。

## TASK-012: Feature / Screen基本UI

### Goal

Project内でFeatureとScreenを登録・一覧できるようにする。

### Scope

- Project Dashboardを追加する。
- Feature作成・一覧を追加する。
- Featureのpurpose、actor、preconditions、successCriteria、failureConditions、confidenceを入力できるようにする。
- Screen作成・一覧を追加する。
- ScreenのscreenType、purpose、preconditions、confidenceを入力できるようにする。
- FeatureとScreenの紐づけを行えるようにする。
- Feature詳細への導線を追加する。
- Project DashboardにはFeature数、Screen数、OpenQuestion数を表示できる構造にする。

### Non-goals

- UiNode編集は実装しない。
- TestViewpoint / TestCaseは実装しない。
- 複雑な検索・フィルタは実装しない。
- Chrome拡張の画面検出は実装しない。

### Acceptance criteria

- Project内にFeatureを作成できる。
- Project内にScreenを作成できる。
- ScreenをFeatureに関連づけられる。
- Feature詳細へ遷移できる。
- Feature / Screenの追加項目を保存できる。
- 再読み込み後もFeature / Screenが保持される。

## TASK-013: Feature Workspace基盤

### Goal

Feature単位で仕様・未確認事項・観点・ケースを編集する中心画面を追加する。

### Scope

- Feature Workspace routeを追加する。
- セクションナビゲーションを追加する。
- Overview / Screens / UI Tree / Data / Rules / Open Questions / Viewpoints / Test Cases の枠を追加する。
- Changes / Traceability / Export Preview は後続Phaseの導線として準備中表示に留める。
- 既存データをFeature単位で読み込む。
- 各セクションの空状態を表示する。
- P0では右ペインの高度なTraceLink / ChangeRecord表示はplaceholderに留めてよい。

### Non-goals

- 各セクションの詳細編集は実装しない。
- Chrome拡張は実装しない。
- カバレッジダッシュボードは実装しない。
- 影響候補表示は実装しない。

### Acceptance criteria

- Feature Workspaceを開ける。
- セクションを切り替えられる。
- Featureの基本情報が表示される。
- Open Questionsセクションの枠が存在する。
- 存在しないFeatureの場合はエラー表示される。
- 後続Phase対象のセクションは準備中表示になる。

## TASK-014: UiNodeツリー手入力UI

### Goal

Feature Workspace上でScreenごとのUiNodeを手入力・ツリー表示できるようにする。

### Scope

- Screen選択UIを追加する。
- UiNode作成フォームを追加する。
- UiNodeツリー表示を追加する。
- parentIdを指定して階層化できるようにする。
- UiNodeのname、role、componentType、textHint、description、selectorHintを編集できるようにする。

### Non-goals

- DOM取得連携は実装しない。
- ドラッグ&ドロップ並び替えは実装しない。
- Element Pickerは実装しない。
- 既存UiNodeとの差分表示は実装しない。
- `label` フィールドや `UiNodeType` enum は追加しない。

### Acceptance criteria

- ScreenにUiNodeを追加できる。
- UiNodeを親子構造で表示できる。
- UiNodeのname、role、componentType、textHint、descriptionを保存できる。
- selectorHintを任意で保存できる。
- 再読み込み後もツリーが保持される。

## TASK-015: Data / BusinessRule編集UI

### Goal

Feature Workspace上でデータ型、業務データ、業務ルールを登録できるようにする。

### Scope

- DataType一覧・作成フォームを追加する。
- DataEntity / DataFieldの基本編集を追加する。
- DataFieldとDataTypeの関連を設定できるようにする。
- BusinessRule一覧・作成フォームを追加する。
- BusinessRule.ruleTypeとしてerror / exceptionも選択できるようにする。
- Feature単位でBusinessRuleを一覧できるようにする。

### Non-goals

- 技法ワークベンチは実装しない。
- デシジョンテーブル生成は実装しない。
- ルールから観点を自動作成しない。
- ErrorCase独立モデルのUIは実装しない。

### Acceptance criteria

- DataTypeを作成できる。
- DataEntityとDataFieldを作成できる。
- DataFieldをDataTypeに紐づけられる。
- BusinessRuleをFeatureに紐づけて作成できる。
- error / exception系のBusinessRuleを登録できる。
- 登録内容が再読み込み後も保持される。

## TASK-016: OpenQuestion / TestViewpoint / TestCase編集UI

### Goal

Feature Workspace上で未確認事項、テスト観点、構造化されたテストケースを作成できるようにする。

### Scope

- OpenQuestion一覧・作成フォームを追加する。
- OpenQuestionのquestion、context、answer、questionStatus、confidenceを編集できるようにする。
- OpenQuestionをFeature / Screen / UiNodeなどの関連対象に紐づけられる構造にする。
- TestViewpoint一覧・作成フォームを追加する。
- TestViewpointのautomationSuitabilityとautomationReasonを扱う。
- TestViewpoint作成時にsource elementsを簡易選択し、`derived_from` TraceLinkを作成できるようにする。
- TestCase一覧・作成フォームを追加する。
- TestViewpointからTestCaseを作成できるようにする。
- priority / automationSuitability / automationReasonなどの基本属性を扱う。
- TestCaseの手順は内部的に `TestStep[]` として保存する。
- P0 UIでは、簡易入力からTestStepへ変換する形でもよい。

### Non-goals

- 実行結果管理は実装しない。
- Playwrightコード生成は実装しない。
- 観点レビュー支援は実装しない。
- 高度なTraceLink編集UIは実装しない。

### Acceptance criteria

- OpenQuestionを作成できる。
- OpenQuestionのquestionStatusとconfidenceを保存できる。
- TestViewpointを作成できる。
- TestViewpointからUiNode / DataType / DataEntity / DataField / BusinessRule / OpenQuestionなどへの `derived_from` TraceLinkを最低限作成できる。
- TestViewpointに紐づくTestCaseを作成できる。
- priority / automationSuitability / automationReasonを保存できる。
- TestCaseの手順が `TestStep[]` として保存される。
- TestStepにaction、instruction、expectedResult、targetUiNodeIdを保持できる。
- Feature単位で未確認事項、観点、ケースを一覧できる。
- OpenQuestion / TestViewpoint / TestCase は再読み込み後も保持される。
- OpenQuestionのquestionStatusとconfidenceは再読み込み後も保持される。
- TestViewpointのautomationSuitabilityとautomationReasonは再読み込み後も保持される。
- TestCase.stepsは `TestStep[]` として保存され、再読み込み後もorder順で復元される。
- TestViewpointとsource elementsの `derived_from` TraceLinkは再読み込み後も保持される。
- TestCaseとTestViewpointの `covers` TraceLinkまたはviewpointIdによる紐づきは再読み込み後も保持される。