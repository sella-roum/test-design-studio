# Phase 5-6 Chrome拡張タスク詳細

## PR-019: Chrome拡張基盤

### Goal
Chrome拡張としてSide Panelを表示し、現在タブと通信できる基盤を作る。

### Scope
- `extension/manifest.json` を追加する。
- Side Panelエントリを追加する。
- Background service workerを追加する。
- Content Scriptを追加する。
- 現在タブのURL / title取得を実装する。

### Non-goals
- Element Pickerは実装しない。
- DOMスキャンは実装しない。
- Webアプリとの完全同期は実装しない。

### Acceptance criteria
- Chrome拡張を読み込める。
- Side Panelを開ける。
- 現在タブのURL / titleを取得できる。
- Content Scriptとのメッセージ通信ができる。

## PR-020: Element Picker最小実装

### Goal
対象ページ上の1要素を選択し、DOM情報を候補として取得できるようにする。

### Scope
- Pickerモードを開始・終了できる。
- hover中の要素をハイライトする。
- clickした要素の情報を取得する。
- tagName / role / text / label / placeholder / selectorCandidatesを取得する。

### Non-goals
- 候補レビューUIは実装しない。
- UiNodeへの保存は実装しない。
- DOM全体スキャンは実装しない。

### Acceptance criteria
- Pickerモードで要素を選択できる。
- 選択要素の主要DOM情報を取得できる。
- selectorCandidatesが生成される。
- 対象ページのDOMを破壊的に変更しない。

## PR-021: DomCaptureCandidateレビューとUiNode取り込み

### Goal
Element Pickerで取得した候補をレビューし、UiNodeとして保存できるようにする。

### Scope
- `DomCaptureCandidate` 型を追加する。
- 候補保存Repositoryを追加する。
- 候補レビューUIを追加する。
- 候補をUiNodeに変換して保存する。
- 登録時にScreenを選択できるようにする。

### Non-goals
- DOM全体スキャンは実装しない。
- 既存UiNodeとの差分判定は実装しない。
- ChangeRecord連携は実装しない。

### Acceptance criteria
- DOM候補を保存できる。
- 候補をレビューできる。
- 候補をUiNodeとして登録できる。
- 登録時にScreenを選択できる。

## Chrome拡張の制約

Chrome拡張は仕様生成エンジンではなく入力補助である。DOMから業務ルール、権限条件、保存仕様、API副作用、テスト優先度、仕様上の意図を断定してはいけない。

対象ページに許容される変更は、一時的なhover highlightやoverlayに限定する。フォーム値変更、ボタンクリック、対象アプリのlocalStorage / IndexedDB変更は禁止する。
