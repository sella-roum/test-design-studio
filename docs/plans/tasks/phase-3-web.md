# Phase 3 Web編集フロータスク詳細

## PR-011: Project一覧・作成UI

### Goal
Webアプリ上でProjectを作成・一覧表示・選択できるようにする。

### Scope
- Project一覧画面を追加する。
- Project作成フォームを追加する。
- Project削除を追加する。
- Project選択後にDashboardへ遷移する。

### Non-goals
- Feature編集は実装しない。
- Export / Importは実装しない。
- Chrome拡張は実装しない。

### Acceptance criteria
- Projectを画面から作成できる。
- 作成したProjectが一覧に表示される。
- Projectを選択してDashboardへ遷移できる。
- 再読み込み後もProjectが残る。

## PR-012: Feature / Screen基本UI

### Goal
Project内でFeatureとScreenを登録・一覧できるようにする。

### Scope
- Project Dashboardを追加する。
- Feature作成・一覧を追加する。
- Screen作成・一覧を追加する。
- FeatureとScreenの紐づけを行えるようにする。

### Non-goals
- UiNode編集は実装しない。
- TestViewpoint / TestCaseは実装しない。
- 複雑な検索・フィルタは実装しない。

### Acceptance criteria
- Project内にFeatureを作成できる。
- Project内にScreenを作成できる。
- ScreenをFeatureに関連づけられる。
- Feature詳細へ遷移できる。

## PR-013: Feature Workspace基盤

### Goal
Feature単位で仕様・観点・ケースを編集する中心画面を追加する。

### Scope
- Feature Workspace routeを追加する。
- セクションナビゲーションを追加する。
- Overview / Screens / Data / Viewpoints / Test Cases / Changes / Export の枠を追加する。
- 既存データをFeature単位で読み込む。

### Non-goals
- 各セクションの詳細編集は実装しない。
- Chrome拡張は実装しない。
- 自動生成は実装しない。

### Acceptance criteria
- Feature Workspaceを開ける。
- セクションを切り替えられる。
- Featureの基本情報が表示される。
- 存在しないFeatureの場合はエラー表示される。

## PR-014: UiNodeツリー手入力UI

### Goal
Feature Workspace上でScreenごとのUiNodeを手入力・ツリー表示できるようにする。

### Scope
- Screen選択UIを追加する。
- UiNode作成フォームを追加する。
- UiNodeツリー表示を追加する。
- parentIdを指定して階層化できるようにする。

### Non-goals
- DOM取り込みは実装しない。
- ドラッグ&ドロップ並び替えは実装しない。
- Element Pickerは実装しない。

### Acceptance criteria
- ScreenにUiNodeを追加できる。
- UiNodeを親子構造で表示できる。
- UiNodeの種別、ラベル、説明を保存できる。
- 再読み込み後もツリーが保持される。

## PR-015: Data / BusinessRule編集UI

### Goal
Feature Workspace上でデータ型と業務ルールを登録できるようにする。

### Scope
- DataType一覧・作成フォームを追加する。
- DataEntity / DataFieldの基本編集を追加する。
- BusinessRule一覧・作成フォームを追加する。

### Non-goals
- 技法ワークベンチは実装しない。
- デシジョンテーブル生成は実装しない。
- AI補助は実装しない。

### Acceptance criteria
- DataTypeを作成できる。
- DataEntityとDataFieldを作成できる。
- BusinessRuleをFeatureに紐づけて作成できる。
- 登録内容が再読み込み後も保持される。

## PR-016: TestViewpoint / TestCase編集UI

### Goal
Feature Workspace上でテスト観点とテストケースを作成できるようにする。

### Scope
- TestViewpoint一覧・作成フォームを追加する。
- TestCase一覧・作成フォームを追加する。
- TestViewpointからTestCaseを作成できるようにする。
- priority / risk / automationCandidateなどの基本属性を扱う。

### Non-goals
- 自動生成は実装しない。
- 実行結果管理は実装しない。
- Playwrightコード生成は実装しない。

### Acceptance criteria
- TestViewpointを作成できる。
- TestViewpointに紐づくTestCaseを作成できる。
- priority / risk / automationCandidateを保存できる。
- Feature単位で観点とケースを一覧できる。
