# Phase 3 Web編集フロータスク詳細

この文書は、Phase 3 のWebアプリ編集フローの実装タスクを定義する。

Phase 3では、Webアプリ単体で1機能分の仕様把握、UI構造、データ条件、業務ルール、テスト観点、テストケースを手入力できる状態を作る。Chrome拡張、AI生成、Playwright生成は扱わない。

## 共通参照

- `docs/specs/00-product-overview.md`
- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- Feature Workspaceを中心導線にする。
- 管理画面を増やしすぎず、1機能の設計を完了させる導線を優先する。
- 画面だけを作って保存できない状態にしない。
- Chrome拡張由来の取り込みは後続Phaseに回す。
- 自動生成よりも、手入力で正しい構造を保存できることを優先する。

## PR-011: Project一覧・作成UI

### Goal

Webアプリ上でProjectを作成・一覧表示・選択できるようにする。

### Reference specs

- `docs/specs/00-product-overview.md`
- `docs/specs/03-web-app-spec.md`

### Scope

- Project一覧画面を追加する。
- Project作成フォームを追加する。
- Project削除または非アクティブ化の導線を追加する。
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
- 再読み込み後もProjectが残る。
- Projectがない場合の空状態が表示される。

## PR-012: Feature / Screen基本UI

### Goal

Project内でFeatureとScreenを登録・一覧できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`

### Scope

- Project Dashboardを追加する。
- Feature作成・一覧を追加する。
- Screen作成・一覧を追加する。
- FeatureとScreenの紐づけを行えるようにする。
- Feature詳細への導線を追加する。

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
- 再読み込み後もFeature / Screenが保持される。

## PR-013: Feature Workspace基盤

### Goal

Feature単位で仕様・観点・ケースを編集する中心画面を追加する。

### Reference specs

- `docs/specs/00-product-overview.md`
- `docs/specs/03-web-app-spec.md`

### Scope

- Feature Workspace routeを追加する。
- セクションナビゲーションを追加する。
- Overview / Screens / UI Tree / Data / Rules / Viewpoints / Test Cases / Changes / Export の枠を追加する。
- 既存データをFeature単位で読み込む。
- 各セクションの空状態を表示する。

### Non-goals

- 各セクションの詳細編集は実装しない。
- Chrome拡張は実装しない。
- 自動生成は実装しない。
- カバレッジダッシュボードは実装しない。

### Acceptance criteria

- Feature Workspaceを開ける。
- セクションを切り替えられる。
- Featureの基本情報が表示される。
- 存在しないFeatureの場合はエラー表示される。
- 未実装セクションは空状態または準備中表示になる。

## PR-014: UiNodeツリー手入力UI

### Goal

Feature Workspace上でScreenごとのUiNodeを手入力・ツリー表示できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/04-chrome-extension-spec.md`

### Scope

- Screen選択UIを追加する。
- UiNode作成フォームを追加する。
- UiNodeツリー表示を追加する。
- parentIdを指定して階層化できるようにする。
- UiNodeの種別、ラベル、説明、selectorHintを編集できるようにする。

### Non-goals

- DOM取り込みは実装しない。
- ドラッグ&ドロップ並び替えは実装しない。
- Element Pickerは実装しない。
- 既存UiNodeとの差分表示は実装しない。

### Acceptance criteria

- ScreenにUiNodeを追加できる。
- UiNodeを親子構造で表示できる。
- UiNodeの種別、ラベル、説明を保存できる。
- selectorHintを任意で保存できる。
- 再読み込み後もツリーが保持される。

## PR-015: Data / BusinessRule編集UI

### Goal

Feature Workspace上でデータ型と業務ルールを登録できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- DataType一覧・作成フォームを追加する。
- DataEntity / DataFieldの基本編集を追加する。
- DataFieldとDataTypeの関連を設定できるようにする。
- BusinessRule一覧・作成フォームを追加する。
- Feature単位でBusinessRuleを一覧できるようにする。

### Non-goals

- 技法ワークベンチは実装しない。
- デシジョンテーブル生成は実装しない。
- AI補助は実装しない。
- ルールから観点を自動生成しない。

### Acceptance criteria

- DataTypeを作成できる。
- DataEntityとDataFieldを作成できる。
- DataFieldをDataTypeに紐づけられる。
- BusinessRuleをFeatureに紐づけて作成できる。
- 登録内容が再読み込み後も保持される。

## PR-016: TestViewpoint / TestCase編集UI

### Goal

Feature Workspace上でテスト観点とテストケースを作成できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- TestViewpoint一覧・作成フォームを追加する。
- TestCase一覧・作成フォームを追加する。
- TestViewpointからTestCaseを作成できるようにする。
- priority / risk / automationCandidateなどの基本属性を扱う。
- TestCaseの手順と期待結果を保存できるようにする。

### Non-goals

- 自動生成は実装しない。
- 実行結果管理は実装しない。
- Playwrightコード生成は実装しない。
- AIによる観点レビューは実装しない。

### Acceptance criteria

- TestViewpointを作成できる。
- TestViewpointに紐づくTestCaseを作成できる。
- priority / risk / automationCandidateを保存できる。
- TestCaseの手順と期待結果を保存できる。
- Feature単位で観点とケースを一覧できる。
