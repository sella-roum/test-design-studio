# Phase 7 変更管理・影響追跡タスク詳細

## PR-022: ChangeRecord基本UI

### Goal
Feature Workspace上で変更履歴を作成・一覧できるようにする。

### Scope
- ChangeRecord一覧を追加する。
- ChangeRecord作成フォームを追加する。
- 変更対象種別を選択できるようにする。
- 変更前、変更後、理由、確度を保存できるようにする。

### Non-goals
- 影響候補の自動提示は実装しない。
- GitHub PR連携は実装しない。
- DOM差分自動検出は実装しない。

### Acceptance criteria
- ChangeRecordを作成できる。
- ChangeRecordをFeature単位で一覧できる。
- 変更対象、変更種別、変更前、変更後、理由を保存できる。

## PR-023: TraceLink UI

### Goal
観点・ケース・仕様要素の関連をTraceLinkとして登録できるようにする。

### Scope
- TraceLink作成UIを追加する。
- linkTypeを選択できるようにする。
- TestViewpoint / TestCase / BusinessRule / UiNodeの関連を登録できるようにする。
- 指定オブジェクトに関連するTraceLinkを一覧できるようにする。

### Non-goals
- 自動リンク生成は実装しない。
- カバレッジダッシュボードは実装しない。
- AIによる関連推定は実装しない。

### Acceptance criteria
- TraceLinkを作成できる。
- linkTypeを保存できる。
- 指定オブジェクトに関連するTraceLinkを一覧できる。

## PR-024: 影響候補表示

### Goal
ChangeRecordから影響しそうなTestViewpoint / TestCaseを候補表示できるようにする。

### Scope
- 影響候補生成サービスを追加する。
- UiNode変更時の関連候補を表示する。
- DataType変更時の関連候補を表示する。
- BusinessRule変更時の関連候補を表示する。
- 候補をTraceLinkとして採用できるようにする。

### Non-goals
- 完全自動の影響分析は実装しない。
- AIによる影響分析は実装しない。
- 外部IssueやPRとの連携は実装しない。

### Acceptance criteria
- ChangeRecordに対して影響候補を表示できる。
- 候補をユーザーが採用・却下できる。
- 採用した候補がTraceLinkとして保存される。

## 影響候補の初期ルール

最初から完璧な影響分析を狙わない。最低限、以下のルールで候補を出す。

- UiNode変更: 同じUiNodeに紐づくTestViewpoint / TestCaseを候補にする。
- DataType変更: そのDataTypeを参照するDataFieldと関連する観点を候補にする。
- BusinessRule変更: そのBusinessRuleから派生した観点やケースを候補にする。
- selector変更: automationCandidateが高いTestCaseを候補にする。

候補は自動確定せず、ユーザーが採用・却下する。
