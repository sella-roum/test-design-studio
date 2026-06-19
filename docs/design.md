# Test Design Studio 設計案

## 1. 概要

### 1.1 コンセプト

**Test Design Studio** は、テスト対象アプリケーションの仕様把握とテスト設計を一体で行うための、ローカルファーストなテスト設計ワークスペースである。

単なるテストケース管理ツールではなく、Webアプリ本体とChrome拡張サイドパネルを組み合わせ、以下を構造化して蓄積することを目的とする。

- 機能・ユースケース
- 画面
- UIツリー
- UI要素
- 状態
- 状態遷移
- フロー
- データモデル
- データ種別
- 業務ルール
- エラー・例外
- 未確認事項
- テスト技法
- テスト観点
- テストケース
- 仕様変更履歴
- トレーサビリティ
- Chrome拡張によるDOMキャプチャ候補
- 既存UIとの差分登録

最終的には、仕様を理解し、仕様の穴を見つけ、テスト観点に変換し、実施手順と期待結果まで落とし込むことを支援する。

---

## 2. 目的

### 2.1 解決したい課題

現場のテスト設計では、次のような問題が起きやすい。

- 画面・UI・フロー・状態・データ・業務ルールが分散している
- テストケースはあるが、なぜそのケースが必要なのか根拠が残っていない
- 仕様変更時に、どのテスト観点・ケースに影響するか追えない
- UI要素や状態がフラットに扱われ、入れ子構造や条件付き表示が表現しづらい
- 同値分割、境界値分析、状態遷移、デシジョンテーブルなどの技法が、実務の設計データに接続されていない
- 未確認仕様や推測仕様が、確定仕様と混ざる
- 仕様把握とテスト設計が別作業になり、引き継ぎやレビューが難しい

### 2.2 本アプリの狙い

本アプリでは、次の状態を目指す。

> テスト対象の仕様を構造化して把握し、その構造からテスト観点とテストケースを作成できる状態。

具体的には、1つの機能について以下を一気通貫で扱えることをMVPの前提とする。

1. 機能・ユースケースを整理する
2. 関連画面を整理する
3. 画面内のUI構造をツリーで整理する
4. データモデルと入力データ種別を整理する
5. 状態・状態遷移・業務ルールを整理する
6. フローと手順を整理する
7. 未確認事項を明示する
8. テスト技法に基づき観点を作成する
9. 観点からテストケースを作成する
10. Markdown / CSV / JSONで出力する
11. 仕様変更時に影響範囲を追えるようにする

---

## 3. MVPの定義

### 3.1 MVPの考え方

このアプリにおけるMVPは、「最低限動くもの」ではない。

**実務で1機能分の仕様把握とテスト設計を最後まで行える最小構成** と定義する。

したがって、MVPでも以下は必須とする。

- 画面定義
- UIツリー
- データモデル
- データ種別
- 状態
- フロー
- 業務ルール
- エラー・例外
- 未確認事項
- テスト技法
- テスト観点
- テストケース
- トレーサビリティ
- 変更履歴
- エクスポート

### 3.2 MVPで後回しにするもの

以下は重要だが、MVPでは後回しにしてよい。

- AI生成
- Playwrightコード生成
- DOM自動解析
- クラウド同期
- 複数人同時編集
- GitHub / Jira / Figma / Notion連携
- クラウド同期
- Web版とChrome拡張版のリアルタイム同期
- 高度な差分比較
- ビジュアル状態遷移エディタ
- 高度なダッシュボード
- 権限付きチーム利用

---

## 4. 対象ユーザー

### 4.1 主な利用者

- QAエンジニア
- テスト設計者
- テスト自動化担当
- 開発者
- PdM / PO
- 仕様把握を行うAIエージェントに前提情報を渡したい人

### 4.2 想定ユースケース

- 新規機能のテスト設計
- 既存機能の仕様把握
- 仕様変更時の影響分析
- リグレッションテスト項目の再設計
- 自動化対象と手動確認対象の切り分け
- AIエージェントやPlaywright実装前の設計情報整理
- 第三者に仕様とテスト設計の根拠を説明するための資料化

---

## 5. 全体情報構造

```text
Project
├── Feature / UseCase
│   ├── Purpose
│   ├── Actor / Role
│   ├── Preconditions
│   ├── Success Criteria
│   └── Failure Conditions
│
├── Screen
│   └── UiTree
│       └── UiNode
│
├── Entity / DataModel
│   └── Field
│
├── DataType
│   ├── Valid Classes
│   ├── Invalid Classes
│   └── Boundary Values
│
├── BusinessRule
│   ├── Condition
│   ├── Expected Behavior
│   └── Evidence
│
├── State
│   ├── Scope
│   ├── Condition
│   └── Observable Result
│
├── StateTransition
│   ├── From State
│   ├── Event
│   ├── To State
│   └── Expected Result
│
├── Flow
│   └── FlowStep
│       ├── Operation
│       └── Expected Result
│
├── Error / Exception
│   ├── Trigger
│   ├── Message
│   └── Recovery
│
├── OpenQuestion
│   ├── Question
│   ├── Target
│   └── Status
│
├── TestViewpoint
│   ├── Target
│   ├── Technique
│   ├── Rationale
│   └── Priority
│
├── TestCase
│   ├── Preconditions
│   ├── Steps
│   ├── Expected Results
│   └── TestData
│
└── ChangeRecord
    ├── Target
    ├── Before
    ├── After
    ├── Reason
    └── Impact
```

---

## 6. 主要モジュール

## 6.1 プロジェクト管理

### 目的

テスト対象アプリケーションや対象プロダクト単位で情報を分離する。

### 主な項目

| 項目 | 内容 |
|---|---|
| プロジェクト名 | テスト対象名 |
| 説明 | 対象アプリの概要 |
| 対象環境 | Web / Mobile Web / Admin / API など |
| 対象デバイス | PC / スマホ / タブレット |
| 備考 | 補足情報 |
| 作成日時 | 作成日 |
| 更新日時 | 更新日 |

---

## 6.2 機能 / ユースケース管理

### 目的

画面より上位の「何を実現する機能か」を整理する。

### 必須項目

| 項目 | 内容 |
|---|---|
| 機能名 | ユーザー作成、ログイン、検索など |
| 目的 | 利用者が何を達成するための機能か |
| アクター | 管理者、一般ユーザー、ゲストなど |
| 前提条件 | ログイン済み、権限あり、対象データありなど |
| 成功条件 | どの状態になれば成功か |
| 失敗条件 | どの状態になれば失敗か |
| 関連画面 | 関連する画面 |
| 関連データ | 関連するエンティティ |
| 関連ルール | 関連する業務ルール |
| 確度 | 確定 / 暫定 / 推測 / 要確認 |
| 根拠 | 仕様書、Figma、実装、MTG、Slackなど |

### 例

```text
機能名: ユーザー作成
目的: 管理者が新しい利用者を登録する
アクター: 管理者
前提条件: 管理者としてログイン済み
成功条件: ユーザーが作成され、一覧に表示される
失敗条件: 入力不備、重複、権限不足
```

---

## 6.3 画面カタログ

### 目的

テスト対象の画面単位で仕様を整理する。

### 主な項目

| 項目 | 内容 |
|---|---|
| 画面名 | ユーザー一覧画面など |
| 画面種別 | 一覧、詳細、作成、編集、確認、完了、エラーなど |
| URL / ルート | `/users` など |
| 目的 | この画面で何をするか |
| 前提条件 | ログイン済み、権限ありなど |
| 関連機能 | 所属する機能 |
| 関連フロー | 関連する業務フロー |
| 状態 | 初期表示、空状態、データあり、エラーなど |
| 根拠 | 仕様書、Figma、実装確認など |

### 画面種別プリセット

```text
一覧
詳細
作成
編集
確認
完了
エラー
設定
ログイン
ダッシュボード
管理画面
```

---

## 6.4 UIツリー管理

### 目的

画面内のUI構造を、テスト設計上の意味のあるツリーとして整理する。

UIはフラットな一覧ではなく、親子関係を持つツリーとして管理する。

### 考え方

DOM構造を完全に再現するのではなく、**テスト設計上意味のあるUIノード** を登録する。

登録対象は以下。

- 操作できるもの
- 表示/非表示が仕様に関係するもの
- 状態を持つもの
- 期待結果で確認するもの
- データを表示するもの
- テスト手順に登場するもの

登録しないもの。

- CSS用のdiv
- 装飾だけのspan
- レイアウト調整だけのラッパー
- 仕様に関係しない装飾アイコン

### UIツリー例

```text
ユーザー一覧画面
├── 検索フォーム
│   ├── キーワード入力欄
│   └── 検索ボタン
├── ユーザー一覧テーブル
│   ├── ヘッダー行
│   ├── ユーザー行
│   │   ├── 名前セル
│   │   ├── メールアドレスセル
│   │   └── 編集ボタン
│   └── ページネーション
└── ユーザー作成ダイアログ
    ├── タイトルテキスト
    ├── ユーザー作成フォーム
    │   ├── 名前フィールド
    │   │   ├── 名前ラベル
    │   │   ├── 名前入力欄
    │   │   └── 名前エラーメッセージ
    │   ├── メールアドレスフィールド
    │   │   ├── メールアドレスラベル
    │   │   ├── メールアドレス入力欄
    │   │   └── メールアドレスエラーメッセージ
    │   └── フォームアクション
    │       ├── キャンセルボタン
    │       └── 保存ボタン
    └── 閉じるボタン
```

### UIノード項目

| 項目 | 内容 |
|---|---|
| 名前 | 保存ボタン、メールアドレス入力欄など |
| nodeType | input, button, dialog, form など |
| role | input, action, container, feedback など |
| 親UI | 親ノード |
| 所属画面 | 画面ID |
| 表示順 | 同階層での順番 |
| 表示条件 | どの条件で表示されるか |
| 操作可能条件 | どの条件で操作可能か |
| データ種別 | 入力欄などに紐づくデータ種別 |
| 状態 | enabled, disabled, invalid など |
| 操作 | click, input, select など |
| 期待される振る舞い | 操作後にどうなるべきか |
| selectorHint | data-testid, role/name の候補 |
| 根拠 | 仕様情報の出所 |

### nodeType候補

```text
screenRegion
section
card
dialog
drawer
popover
form
fieldGroup
label
text
input
textarea
select
checkbox
radioGroup
button
link
table
tableRow
tableCell
list
listItem
tabGroup
tab
toast
alert
loader
pagination
fileUpload
```

### role候補

```text
container
input
action
navigation
display
feedback
dataView
layout
```

---

## 6.5 データモデル / エンティティ管理

### 目的

業務データそのものの構造を整理する。

データ種別とは別に、業務上のエンティティを管理する。

### データ種別との違い

| 概念 | 例 | 意味 |
|---|---|---|
| エンティティ | ユーザー | 業務データのまとまり |
| フィールド | email | エンティティが持つ項目 |
| データ種別 | メールアドレス | 入力値・値の性質 |

### エンティティ項目

| 項目 | 内容 |
|---|---|
| エンティティ名 | ユーザー、注文、プロジェクトなど |
| 説明 | 何を表すデータか |
| 関連機能 | どの機能で使うか |
| 関連画面 | どの画面で表示・編集されるか |
| ライフサイクル | 作成、編集、削除、無効化など |
| 関連状態 | 下書き、承認済み、削除済みなど |

### フィールド項目

| 項目 | 内容 |
|---|---|
| フィールド名 | email |
| 表示名 | メールアドレス |
| 型 | string, number, date, enum など |
| 必須 | 必須 / 任意 |
| 一意制約 | あり / なし |
| 初期値 | 作成時の初期値 |
| 更新可否 | 作成後に変更できるか |
| 関連データ種別 | メールアドレスなど |
| 関連業務ルール | 重複不可など |

---

## 6.6 データ種別カタログ

### 目的

入力値の性質を整理し、同値分割や境界値分析に接続する。

### 主な項目

| 項目 | 内容 |
|---|---|
| データ種別名 | メールアドレス、氏名、日付、金額など |
| 種別 | string, number, date, enum, file など |
| 空値許容 | 可 / 不可 |
| 有効値例 | 正常に受け付ける値 |
| 無効値例 | 拒否すべき値 |
| 最小値 | 文字数、数値、日付など |
| 最大値 | 文字数、数値、日付など |
| 境界値 | min-1, min, min+1, max-1, max, max+1 |
| 関連技法 | 同値分割、境界値分析 |
| 備考 | 補足 |

### 例

```text
データ種別: メールアドレス
有効値:
- test@example.com

無効値:
- test
- @example.com
- test@
- 空値

技法:
- 同値分割
```

---

## 6.7 状態カタログ

### 目的

アプリ・画面・UI・フォーム・データ・フローなどの状態を整理する。

状態は、以下のように定義する。

> 対象が、ある条件下で、観測可能なふるまい・表示・制約を持っていること。

### 状態のスコープ

```text
アプリ全体
ユーザー/セッション
画面
UI要素
フォーム
データ
フロー
通信/非同期
表示/レイアウト
外部連携
```

### 状態項目

| 項目 | 内容 |
|---|---|
| 状態名 | 未入力、保存中、承認済みなど |
| スコープ | 画面、UI要素、データなど |
| 対象 | 対象画面、対象UI、対象データなど |
| 状態になる条件 | どの条件でその状態になるか |
| 観測できる結果 | ユーザーから見える表示・制約 |
| 次に可能な操作 | この状態で可能な操作 |
| 禁止される操作 | この状態で不可の操作 |
| 期待結果 | テスト時に確認すべき結果 |
| 関連技法 | 状態遷移、デシジョンテーブルなど |
| 根拠 | 仕様情報の出所 |

### 共通状態プリセット

```text
初期表示
空データ
データあり
読み込み中
保存中
保存成功
保存失敗
未入力
入力中
入力済み
バリデーションエラー
無効状態
表示中
非表示
完了
失敗
中断
```

---

## 6.8 状態遷移管理

### 目的

状態間の遷移を整理し、状態遷移テストに接続する。

### 状態遷移項目

| 項目 | 内容 |
|---|---|
| 対象 | データ、画面、UI、フローなど |
| 現在状態 | from |
| イベント | 状態を変える操作・きっかけ |
| 次状態 | to |
| 条件 | 遷移が成立する条件 |
| 期待結果 | 遷移後に観測できる結果 |
| 不正遷移 | 許可されない遷移 |
| 関連テスト観点 | 状態遷移から作る観点 |

### 例

| 現在状態 | イベント | 次状態 | 条件 | 期待結果 |
|---|---|---|---|---|
| 下書き | 申請する | 申請中 | 必須項目入力済み | ステータスが申請中になる |
| 申請中 | 承認する | 承認済み | 承認者権限あり | 承認済みになる |
| 申請中 | 差し戻す | 差し戻し | コメント入力済み | 差し戻しになる |

---

## 6.9 業務ルール管理

### 目的

UIだけでは表現できない仕様・制約・条件を整理する。

### 主な項目

| 項目 | 内容 |
|---|---|
| ルール名 | メールアドレス一意制約など |
| 対象 | 機能、データ、UI、フローなど |
| 条件 | どの条件で適用されるか |
| 期待される振る舞い | 条件成立時にどう動くか |
| 例外 | 例外条件 |
| 関連データ | 対象エンティティ・フィールド |
| 関連画面 | 関連する画面 |
| 関連技法 | デシジョンテーブル、同値分割など |
| 根拠 | 仕様書、MTG、実装確認など |
| 確度 | 確定 / 暫定 / 推測 / 要確認 |

### 例

```text
ルール名: メールアドレス一意制約
対象: ユーザー.email
条件: 同じメールアドレスの有効ユーザーが存在する
期待される振る舞い: 登録できず、重複エラーを表示する
例外: 削除済みユーザーのメールアドレスは再利用可能
```

---

## 6.10 フロー管理

### 目的

業務フローや画面遷移、操作手順を整理する。

### フロー項目

| 項目 | 内容 |
|---|---|
| フロー名 | ユーザーを作成する |
| 目的 | フローの目的 |
| 開始画面 | 開始地点 |
| 終了画面 | 終了地点 |
| 前提条件 | フロー開始に必要な条件 |
| 成功条件 | フロー完了時の状態 |
| 代替パス | 分岐する正常系 |
| 例外パス | 異常系 |
| 関連機能 | 対応する機能 |
| 関連状態 | 状態変化 |
| 関連データ | 使用するデータ |

### フローステップ項目

| 項目 | 内容 |
|---|---|
| 順番 | ステップ番号 |
| 対象画面 | 操作する画面 |
| 対象UI | 操作対象のUIノード |
| 操作 | click, input, select など |
| 入力データ | 使用するデータ |
| 期待結果 | 操作後の結果 |
| 遷移先状態 | 次の状態 |
| 関連ルール | 適用される業務ルール |

---

## 6.11 エラー・例外管理

### 目的

異常系と復旧仕様を整理する。

エラーは単に「発生する」だけでなく、「ユーザーがどう復旧できるか」まで扱う。

### 主な項目

| 項目 | 内容 |
|---|---|
| エラー名 | 必須エラー、重複エラー、通信エラーなど |
| 発生条件 | どの条件で発生するか |
| 対象 | 画面、UI、データ、APIなど |
| 表示内容 | エラーメッセージ、表示位置 |
| 復旧方法 | 修正、再試行、戻る、キャンセルなど |
| 入力保持 | 失敗時に入力値を保持するか |
| 副作用 | 保存済みか、ロールバックされるか |
| 関連テスト観点 | 異常系・復旧系の観点 |

### 例

```text
エラー名: メールアドレス重複エラー
発生条件: 有効ユーザーに同じメールアドレスが存在する
表示内容: メールアドレス欄下に「既に使用されています」と表示
復旧方法: 別のメールアドレスを入力して再送信
入力保持: 他項目は保持する
```

---

## 6.12 未確認事項管理

### 目的

仕様の穴や確認待ち事項を管理する。

### 主な項目

| 項目 | 内容 |
|---|---|
| 質問 | 確認したい内容 |
| 対象 | 機能、画面、UI、データ、ルールなど |
| 優先度 | 高 / 中 / 低 |
| 状態 | 未確認 / 確認中 / 回答済み / 保留 |
| 回答 | 確認結果 |
| 確認先 | PdM、開発者、クライアントなど |
| 確認日 | 回答を得た日 |
| 関連テスト観点 | 回答により影響する観点 |
| 関連変更 | 回答による仕様変更 |

### 例

```text
質問: 削除済みユーザーのメールアドレスは再利用できるか
対象: ユーザー作成
優先度: 高
状態: 未確認
```

---

## 6.13 テスト技法ワークベンチ

### 目的

構造化した仕様情報を、テスト技法に基づく観点へ変換する。

### MVPで扱う技法

| 技法 | 主な対象 |
|---|---|
| 同値分割 | データ種別、有効値、無効値 |
| 境界値分析 | 文字数、数値、日付、件数 |
| 状態遷移テスト | データ状態、画面状態、フロー状態 |
| デシジョンテーブル | 複数条件と結果 |
| ユースケーステスト | 業務フロー、画面遷移 |

### 技法適用例

```text
対象: メールアドレス入力欄
データ種別: メールアドレス
技法: 同値分割

有効同値クラス:
- 正しいメール形式

無効同値クラス:
- @がない
- ドメインがない
- ローカル部がない
- 空値
```

---

## 6.14 テスト観点管理

### 目的

テストケース化する前の確認観点を整理する。

### 主な項目

| 項目 | 内容 |
|---|---|
| 観点名 | 何を確認するか |
| 対象 | 機能、画面、UI、データ、状態など |
| 技法 | 同値分割、境界値分析など |
| 根拠 | 仕様・ルール・状態・データなど |
| 優先度 | 高 / 中 / 低 |
| リスク | 影響度、発生可能性 |
| 自動化候補 | 高 / 中 / 低 |
| ステータス | 候補 / 採用 / 却下 / 要確認 |
| 関連テストケース | ケースとの紐づき |

### 例

| 観点 | 対象 | 技法 | 根拠 |
|---|---|---|---|
| 必須項目未入力時にエラーになる | 氏名入力欄 | 同値分割 | 空値は無効クラス |
| 最大文字数を超える氏名を拒否する | 氏名入力欄 | 境界値分析 | 最大文字数境界 |
| 保存中は二重送信できない | 保存ボタン | 状態遷移 | 保存中状態では再操作不可 |
| 作成成功後に一覧へ反映される | ユーザー作成フロー | ユースケース | 主成功パス |

---

## 6.15 テストケース管理

### 目的

テスト観点を、実施可能な手順と期待結果に落とし込む。

### 主な項目

| 項目 | 内容 |
|---|---|
| ケース名 | テストケース名 |
| 対象観点 | 紐づくテスト観点 |
| 前提条件 | 実施前に必要な状態 |
| 手順 | 実施手順 |
| 期待結果 | 各手順に対する期待結果 |
| 使用データ | テストデータ |
| 優先度 | 高 / 中 / 低 |
| 自動化可否 | 高 / 中 / 低 |
| ステータス | 下書き / 確定 / 廃止 |
| 関連変更 | 仕様変更との紐づき |

### 手順と期待結果の粒度

悪い例。

```text
手順: ユーザーを作成する
期待結果: 作成できる
```

良い例。

| 手順 | 期待結果 |
|---|---|
| ユーザー一覧画面を開く | 新規作成ボタンが表示される |
| 新規作成ボタンをクリックする | ユーザー作成ダイアログが表示される |
| 氏名欄を空のままにする | 氏名欄は未入力状態である |
| 保存ボタンをクリックする | 氏名必須エラーが表示され、保存されない |

---

## 6.16 トレーサビリティ管理

### 目的

仕様情報とテスト設計情報の紐づきを追跡する。

### 追跡したい関係

```text
機能
→ 業務ルール
→ 画面
→ UI要素
→ データ
→ 状態
→ テスト観点
→ テストケース
```

### 主な項目

| 項目 | 内容 |
|---|---|
| 関連元 | 機能、画面、UI、ルールなど |
| 関連先 | 観点、ケース、フローなど |
| 関連理由 | なぜ紐づくのか |
| カバー状態 | 未カバー / 一部カバー / カバー済み |
| 変更影響 | 変更時に見直すべき対象 |

### 価値

- 仕様変更時の影響範囲が分かる
- テスト観点の根拠が分かる
- 未カバー仕様を検出できる
- レビュー時に説明しやすい

---

## 6.17 変更管理

### 目的

新規追加だけでなく、既存画面・既存UI・既存ルールへの変更を記録する。

実務では新規UIより既存仕様の変更の方が多いため、MVPでも変更管理は必要。

### 扱う変更種別

| 変更種別 | 例 |
|---|---|
| UI追加 | 新しい入力欄を追加 |
| UI削除 | 既存ボタンを削除 |
| UI変更 | ラベル名、表示順、配置を変更 |
| 入力仕様変更 | 必須→任意、最大文字数変更 |
| 表示条件変更 | 特定権限だけ表示 |
| 操作条件変更 | 保存ボタンの活性条件変更 |
| 状態変更 | 保存中は入力欄をdisabled |
| フロー変更 | 保存後の遷移先変更 |
| 業務ルール変更 | メール再利用条件変更 |
| 期待結果変更 | エラー文言や表示位置変更 |
| データ変更 | 保存対象フィールド追加 |

### 変更レコード項目

| 項目 | 内容 |
|---|---|
| 対象種別 | feature, screen, uiNode, dataType, rule など |
| 対象ID | 変更対象 |
| 変更種別 | added, updated, removed など |
| 変更前 | 変更前の概要 |
| 変更後 | 変更後の概要 |
| 変更理由 | なぜ変わったか |
| 情報ソース | 仕様書、MTG、実装確認など |
| 確度 | 確定 / 暫定 / 推測 / 要確認 |
| 影響メモ | 見直すべき仕様・観点・ケース |
| 作成日時 | 変更登録日 |

### 削除の扱い

仕様把握とテスト設計では、物理削除より **廃止扱い** を基本とする。

```text
active
deprecated
removed
```

過去仕様を残すことで、変更背景や既存テストの廃止理由を追えるようにする。

---

## 7. 非機能・環境・テストデータ

## 7.1 非機能要件

MVPではチェックリスト形式で持つ。

| 分類 | 例 |
|---|---|
| パフォーマンス | 一覧1000件で表示できるか |
| セキュリティ | 権限なしでアクセスできないか |
| アクセシビリティ | キーボード操作、ラベル、フォーカス順 |
| レスポンシブ | PC/スマホで表示・操作できるか |
| 可用性 | 通信失敗時に復帰できるか |
| 互換性 | Chrome, Safari, Edge, mobile browser |
| データ保護 | 個人情報、ローカル保存、削除 |

---

## 7.2 環境・プラットフォーム条件

仕様は環境や端末で変わるため、確認条件を記録する。

| 項目 | 内容 |
|---|---|
| 対象環境 | local / dev / staging / production |
| デバイス | PC / tablet / smartphone |
| ブラウザ | Chrome / Safari / Edge / Firefox |
| OS | Windows / macOS / iOS / Android |
| 画面幅 | desktop / mobile |
| 設定 | feature flag, tenant setting, plan |
| データ状態 | 初期データ、大量データ、異常データ |

---

## 7.3 テストデータ設計

データ種別とは別に、実際に使うテストデータセットを管理する。

| 種別 | 例 |
|---|---|
| 正常データ | 有効なユーザー |
| 異常データ | 不正メール、欠損値 |
| 境界データ | 最大文字数、最小値、期限当日 |
| 状態別データ | 下書き、承認済み、削除済み |
| 権限別データ | 管理者、一般、ゲスト |
| 量的データ | 0件、1件、100件、1000件 |
| 組み合わせデータ | 権限 × ステータス × 入力値 |

---

## 8. カバレッジモデル

### 8.1 目的

仕様把握・テスト設計の抜け漏れを可視化する。

### カバレッジ種別

| カバレッジ | 内容 |
|---|---|
| 画面カバレッジ | 登録画面のうち観点作成済みの割合 |
| UIカバレッジ | UI要素に観点が紐づいているか |
| データカバレッジ | データ種別に有効/無効/境界値があるか |
| 状態カバレッジ | 状態ごとの観点があるか |
| フローカバレッジ | 主成功/代替/例外パスがあるか |
| ルールカバレッジ | 業務ルールごとにテスト観点があるか |
| 権限カバレッジ | ロール別の確認があるか |
| 変更影響カバレッジ | 仕様変更に対する観点・ケース更新が完了しているか |

---

## 9. 画面構成案

### 9.1 主要画面

| 画面 | 役割 |
|---|---|
| プロジェクト一覧 | テスト対象を選ぶ |
| プロジェクトダッシュボード | 画面数、UI要素数、観点数、ケース数を見る |
| 機能/ユースケース一覧 | 機能単位で仕様を整理する |
| 画面カタログ | 画面を管理する |
| UIツリーエディタ | 入れ子UIを管理する |
| データモデル管理 | エンティティとフィールドを管理する |
| データ種別カタログ | 入力値・境界値・同値クラスを管理する |
| 状態カタログ | 共通/固有状態を管理する |
| 状態遷移表 | 状態間の遷移を管理する |
| 業務ルール一覧 | 条件・期待動作・例外を管理する |
| フローエディタ | 操作フローを管理する |
| エラー/例外一覧 | 異常系と復旧仕様を管理する |
| 未確認事項一覧 | 仕様の穴を管理する |
| テスト技法ワークベンチ | 技法ごとに観点を作る |
| テスト観点一覧 | 観点を整理する |
| テストケース一覧 | 手順・期待結果を管理する |
| 変更履歴 | 仕様変更と影響範囲を見る |
| エクスポート画面 | Markdown / CSV / JSON出力 |

### 9.2 PCとスマホの使い分け

| デバイス | 主な用途 |
|---|---|
| PC | 仕様整理、UIツリー編集、テーブル編集、エクスポート |
| スマホ | 現場確認、簡易メモ、未確認事項登録、レビュー確認 |

MVPではPC優先でよい。  
ただし、スマホでも閲覧・軽い編集が可能なレスポンシブ設計にする。

---

## 10. IndexedDB データモデル案

MVP時点の概念モデルを以下に示す。

```ts
type Project = {
  id: string;
  name: string;
  description?: string;
  targetEnvironment?: string;
  createdAt: string;
  updatedAt: string;
};

type Feature = {
  id: string;
  projectId: string;
  name: string;
  purpose: string;
  actors: string[];
  preconditions?: string;
  successCriteria?: string;
  failureConditions?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
  evidenceIds?: string[];
  createdAt: string;
  updatedAt: string;
};

type Screen = {
  id: string;
  projectId: string;
  featureId?: string;
  name: string;
  screenType: string;
  route?: string;
  purpose?: string;
  preconditions?: string;
  createdAt: string;
  updatedAt: string;
};

type UiNode = {
  id: string;
  projectId: string;
  screenId: string;
  parentId?: string | null;
  order: number;
  name: string;
  nodeType: string;
  role: string;
  description?: string;
  selectorHint?: string;
  visibilityCondition?: string;
  enabledCondition?: string;
  dataTypeId?: string | null;
  isTestTarget: boolean;
  status: "active" | "deprecated" | "removed";
  createdAt: string;
  updatedAt: string;
};

type Entity = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type EntityField = {
  id: string;
  projectId: string;
  entityId: string;
  name: string;
  displayName?: string;
  fieldType: string;
  required: boolean;
  unique?: boolean;
  defaultValue?: string;
  editable?: boolean;
  dataTypeId?: string;
};

type DataType = {
  id: string;
  projectId: string;
  name: string;
  kind: string;
  required?: boolean;
  validExamples: string[];
  invalidExamples: string[];
  minValue?: string;
  maxValue?: string;
  boundaryExamples?: string[];
  notes?: string;
};

type StateDefinition = {
  id: string;
  projectId: string;
  name: string;
  scope:
    | "app"
    | "user"
    | "screen"
    | "uiElement"
    | "form"
    | "data"
    | "flow"
    | "async"
    | "layout"
    | "external";
  targetType?: string;
  targetId?: string;
  condition: string;
  observableResult: string;
  allowedOperations?: string[];
  disallowedOperations?: string[];
  expectedResult?: string;
  priority: "high" | "medium" | "low";
};

type StateTransition = {
  id: string;
  projectId: string;
  targetType: string;
  targetId?: string;
  fromStateId: string;
  event: string;
  toStateId: string;
  condition?: string;
  expectedResult: string;
};

type BusinessRule = {
  id: string;
  projectId: string;
  name: string;
  targetType: string;
  targetId?: string;
  condition: string;
  expectedBehavior: string;
  exceptions?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
  evidenceIds?: string[];
};

type Flow = {
  id: string;
  projectId: string;
  featureId?: string;
  name: string;
  purpose?: string;
  startScreenId?: string;
  endScreenId?: string;
  preconditions?: string;
  successCriteria?: string;
};

type FlowStep = {
  id: string;
  projectId: string;
  flowId: string;
  order: number;
  screenId?: string;
  uiNodeId?: string;
  operation: string;
  inputData?: string;
  expectedResult: string;
  nextStateId?: string;
};

type ErrorSpec = {
  id: string;
  projectId: string;
  name: string;
  targetType: string;
  targetId?: string;
  trigger: string;
  message?: string;
  displayLocation?: string;
  recovery?: string;
  inputRetention?: boolean;
};

type OpenQuestion = {
  id: string;
  projectId: string;
  question: string;
  targetType?: string;
  targetId?: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "answered" | "deferred";
  answer?: string;
  assignee?: string;
  answeredAt?: string;
};

type TestViewpoint = {
  id: string;
  projectId: string;
  name: string;
  targetType: string;
  targetId?: string;
  technique: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  automationCandidate?: "high" | "medium" | "low";
  status: "candidate" | "accepted" | "rejected" | "needs_confirmation";
};

type TestCase = {
  id: string;
  projectId: string;
  title: string;
  viewpointIds: string[];
  preconditions?: string;
  priority: "high" | "medium" | "low";
  automationCandidate?: "high" | "medium" | "low";
  status: "draft" | "confirmed" | "deprecated";
};

type TestCaseStep = {
  id: string;
  projectId: string;
  testCaseId: string;
  order: number;
  action: string;
  expectedResult: string;
  testData?: string;
};

type TraceLink = {
  id: string;
  projectId: string;
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  reason?: string;
  coverageStatus?: "not_covered" | "partially_covered" | "covered";
};

type ChangeRecord = {
  id: string;
  projectId: string;
  targetType: string;
  targetId: string;
  changeType:
    | "added"
    | "updated"
    | "removed"
    | "renamed"
    | "moved"
    | "conditionChanged"
    | "behaviorChanged"
    | "validationChanged";
  beforeSummary?: string;
  afterSummary: string;
  reason?: string;
  source?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
  impactNotes?: string;
  createdAt: string;
};
```

---

## 11. Dexie テーブル案

```ts
db.version(1).stores({
  projects: "id, name, updatedAt",

  features: "id, projectId, name, updatedAt",
  screens: "id, projectId, featureId, name, screenType, updatedAt",

  uiNodes: "id, projectId, screenId, parentId, nodeType, role, order, status",

  entities: "id, projectId, name",
  entityFields: "id, projectId, entityId, name, dataTypeId",

  dataTypes: "id, projectId, name, kind",

  states: "id, projectId, scope, targetType, targetId, name",
  stateTransitions: "id, projectId, targetType, targetId, fromStateId, toStateId",

  businessRules: "id, projectId, targetType, targetId, name",

  flows: "id, projectId, featureId, name",
  flowSteps: "id, projectId, flowId, order, screenId, uiNodeId",

  errorSpecs: "id, projectId, targetType, targetId, name",

  openQuestions: "id, projectId, status, priority, targetType, targetId",

  testViewpoints: "id, projectId, targetType, targetId, technique, status, priority",
  testCases: "id, projectId, status, priority",
  testCaseSteps: "id, projectId, testCaseId, order",

  traceLinks: "id, projectId, fromType, fromId, toType, toId, coverageStatus",

  changeRecords: "id, projectId, targetType, targetId, changeType, createdAt",

  domCaptureCandidates: "id, projectId, screenId, tabUrl, capturedAt, captureMethod, status"
});
```

---

## 12. 入力フロー

### 12.1 推奨入力順

```text
1. プロジェクトを作成する
2. 機能/ユースケースを登録する
3. 関連画面を登録する
4. 画面内のUIツリーを登録する
5. エンティティ/データモデルを登録する
6. データ種別を登録する
7. UI要素とデータ種別を紐づける
8. 状態を登録する
9. 状態遷移を登録する
10. 業務ルールを登録する
11. フローを登録する
12. エラー/例外を整理する
13. 未確認事項を登録する
14. テスト技法ワークベンチで観点を作る
15. 観点からテストケースを作る
16. Markdown / CSV / JSONで出力する
```

### 12.2 入力負荷を下げる工夫

- UIノードテンプレートを用意する
- 共通状態プリセットを用意する
- よくあるデータ種別プリセットを用意する
- フォーム・ダイアログ・テーブル構造をテンプレート化する
- 必須項目と詳細項目を分ける
- 最初は粗く登録し、あとから詳細化できるようにする
- 未確認事項として逃がせる導線を用意する

---

## 13. UI構造テンプレート

### 13.1 フォームフィールド

```text
フィールド
├── ラベル
├── 入力欄
├── 補足テキスト
└── エラーメッセージ
```

### 13.2 モーダルフォーム

```text
ダイアログ
├── タイトル
├── 説明文
├── フォーム
│   └── フィールド...
└── アクション
    ├── キャンセルボタン
    └── 保存ボタン
```

### 13.3 検索一覧

```text
検索エリア
├── キーワード入力
├── 条件セレクト
└── 検索ボタン

一覧テーブル
├── ヘッダー
├── 行
│   └── 行アクション
└── ページネーション
```

### 13.4 確認ダイアログ

```text
確認ダイアログ
├── メッセージ
├── キャンセルボタン
└── 実行ボタン
```

### 13.5 タブ画面

```text
タブグループ
├── タブ
├── タブ
└── タブパネル
    └── コンテンツ
```

---

## 14. 出力形式

## 14.1 Markdown出力

目的は、仕様把握とテスト設計をレビュー可能な文書として出力すること。

### 章立て

```text
# 機能仕様・テスト設計書

## 1. 機能概要
## 2. 利用者・権限
## 3. 関連画面
## 4. UI構造
## 5. データモデル
## 6. 入力データ種別
## 7. 業務ルール
## 8. 状態・状態遷移
## 9. フロー
## 10. エラー・例外
## 11. 未確認事項
## 12. テスト観点
## 13. テストケース
## 14. 変更履歴
## 15. トレーサビリティ
```

---

## 14.2 CSV出力

主な用途。

- スプレッドシートでのレビュー
- テスト管理表への取り込み
- 観点一覧の共有
- テストケース一覧の共有

出力対象。

- 画面一覧
- UIノード一覧
- データ種別一覧
- 業務ルール一覧
- 状態一覧
- フロー一覧
- テスト観点一覧
- テストケース一覧
- 未確認事項一覧
- 変更履歴一覧

---

## 14.3 JSON出力

主な用途。

- バックアップ
- 端末間移行
- 将来の同期
- AIエージェントへの入力
- Git管理

---

## 15. サンプル対象機能

MVP検証には「ユーザー管理機能」を使う。

### 15.1 対象画面

```text
- ユーザー一覧画面
- ユーザー作成ダイアログ
- ユーザー編集ダイアログ
- 削除確認ダイアログ
```

### 15.2 対象UI

```text
- 検索フォーム
- 一覧テーブル
- 作成ボタン
- 入力フォーム
- 保存ボタン
- キャンセルボタン
- エラーメッセージ
- トースト
```

### 15.3 対象データ

```text
- 氏名
- メールアドレス
- 権限
- ステータス
```

### 15.4 対象状態

```text
- 空一覧
- データあり
- フォーム未入力
- 入力済み
- バリデーションエラー
- 保存中
- 保存成功
- 削除確認中
- 削除完了
```

### 15.5 対象フロー

```text
- ユーザー作成
- ユーザー編集
- ユーザー削除
- ユーザー検索
```

### 15.6 対象技法

```text
- 同値分割
- 境界値分析
- 状態遷移テスト
- ユースケーステスト
- デシジョンテーブル
```

---

## 16. MVP受け入れ基準

MVP完了条件は、機能数ではなく、実際に1機能分の仕様把握とテスト設計ができること。

### 16.1 必須受け入れ基準

```text
1. 1つのプロジェクトを作成できる
2. 1つの機能/ユースケースを登録できる
3. 3画面以上を登録できる
4. 各画面に入れ子のUIツリーを登録できる
5. UI要素にデータ種別を紐づけられる
6. エンティティとフィールドを登録できる
7. 共通状態・画面状態・UI要素状態・データ状態を登録できる
8. 状態遷移を登録できる
9. 業務ルールを登録できる
10. エラー・例外と復旧仕様を登録できる
11. 1つ以上の業務フローを登録できる
12. 未確認事項を登録できる
13. 同値分割・境界値分析・状態遷移・ユースケース・デシジョンテーブルの観点を作れる
14. 観点からテストケースを作れる
15. 手順と期待結果を複数ステップで書ける
16. 仕様情報と観点・ケースをトレーサビリティで紐づけられる
17. 既存UIや業務ルールに対する変更を記録できる
18. 変更に対して影響する観点・ケースを紐づけられる
19. Markdown / CSV / JSONで出力できる
20. IndexedDBに保存され、リロード後も復元できる
21. JSONでバックアップ/復元できる
22. Chrome拡張のSide Panelから現在画面を解析できる
23. UI選択モードでDOM要素を選択できる
24. DOM候補を新規UI・既存UI紐づけ・既存UI変更として登録できる
25. DOMキャプチャ由来の変更をChangeRecordとして残せる
```

---

## 17. 優先実装順

### Phase 1: 土台

1. プロジェクト管理
2. 機能/ユースケース管理
3. 画面カタログ
4. UIツリー管理
5. IndexedDB永続化

### Phase 2: 仕様把握

1. エンティティ/データモデル
2. データ種別
3. 状態カタログ
4. 業務ルール
5. 未確認事項

### Phase 3: テスト設計

1. フロー管理
2. 状態遷移
3. エラー/例外
4. テスト技法ワークベンチ
5. テスト観点管理

### Phase 4: テストケース化

1. テストケース管理
2. 手順・期待結果エディタ
3. テストデータ管理
4. 自動化可否メモ

### Phase 5: 実務利用

1. トレーサビリティ
2. 変更履歴
3. Markdown出力
4. CSV出力
5. JSONバックアップ/復元
6. カバレッジ表示

---

## 18. 実装方針

### 18.1 技術スタック案

```text
Frontend:
- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- shadcn/ui

Storage:
- IndexedDB
- Dexie.js

Export:
- Markdown
- CSV
- JSON

Chrome Extension MVP:
- Manifest V3
- Side Panel API
- Background Service Worker
- Content Script
- DOM Capture / Element Picker

Optional later:
- Cloudflare Pages
- Cloudflare Workers
- Cloudflare AI
- Playwright export
```

### 18.2 IndexedDBを使う理由

- ローカルファーストで使える
- 仕様情報やテスト設計情報を端末内に保存できる
- サーバーDBなしでMVPを成立させられる
- JSONバックアップにより移行できる
- 将来クラウド同期を追加できる
- 機密性のある仕様情報を外部送信しない設計にできる

### 18.3 注意点

- IndexedDBは端末・ブラウザごとに独立する
- 自動同期はされない
- ブラウザのストレージ制限がある
- プライベートモードでは挙動が変わる可能性がある
- バックアップ/復元はMVPから必須
- スキーママイグレーションを考慮する必要がある

---

## 19. リスクと対策

| リスク | 内容 | 対策 |
|---|---|---|
| 入力が重すぎる | 情報量が多く、使い始めに負担が大きい | テンプレート、プリセット、段階入力を用意する |
| ただの台帳になる | 技法や観点に接続されない | テスト技法ワークベンチをMVPに含める |
| 仕様とテストが分断される | 仕様情報だけ登録して終わる | トレーサビリティを必須にする |
| 変更追従できない | 仕様変更時に影響範囲が分からない | 変更履歴と影響リンクを持つ |
| UIツリーが細かすぎる | DOM再現になり入力が破綻する | テスト設計上意味のあるUIだけ登録する |
| データが端末に閉じる | PC/スマホ間で共有しづらい | JSONエクスポート/インポートを必須にする |
| 状態が曖昧になる | 状態・イベント・条件・期待結果が混ざる | 状態定義にスコープ、条件、観測結果を持たせる |

---

## 20. 最終判断

このアプリの本質は、テストケースを書くことではない。

本質は以下である。

> 仕様を構造化して理解し、仕様の穴を見つけ、テスト観点とテストケースに変換し、仕様変更時にも追従できるようにすること。

そのため、MVPでも以下は妥協しない。

```text
- UIツリー
- データモデル
- データ種別
- 状態
- 業務ルール
- フロー
- エラー/例外
- 未確認事項
- テスト技法
- テスト観点
- テストケース
- トレーサビリティ
- 変更履歴
- エクスポート
```

一方で、AI生成、Playwrightコード生成、クラウド同期、DOM解析は後回しでよい。

最初は「ユーザー管理機能」など1つの機能を題材に、仕様把握からテストケース出力まで深く設計できることを確認する。  
ここまでできれば、単なるテストケース管理ではなく、**仕様把握とテスト設計をつなぐ実用ツール**として成立する。


---

## 21. Chrome拡張MVP追加設計

## 21.1 方針

本設計では、Chrome拡張機能もMVPスコープに含める。

ただし、Chrome拡張の位置づけは「自動で完全な仕様書やテストケースを生成する機能」ではない。目的は、**実際のテスト対象画面を開いた状態で、画面・UI・状態・変更差分の入力負荷を下げること**である。

```text
テスト対象画面を開く
  ↓
Chrome拡張のSide Panelを開く
  ↓
現在画面のURL・title・DOMを取得する
  ↓
UI候補を抽出する
  ↓
ユーザーが候補を確認する
  ↓
新規UIとして追加 / 既存UIに紐づけ / 既存UIの変更として登録する
  ↓
仕様把握・テスト設計情報に接続する
```

---

## 21.2 Chrome拡張をMVPに含める理由

### 21.2.1 入力負荷を下げるため

本アプリは、仕様把握とテスト設計を深く行うため、入力項目が多い。画面名、UI要素、フォーム、ボタン、テーブル、ダイアログ、入力属性などをすべて手入力すると、実務で使いづらくなる。

Chrome拡張で現在画面を解析できれば、以下の入力を補助できる。

- 画面URL
- 画面タイトル
- 見出し
- フォーム
- 入力欄
- ボタン
- セレクト
- テーブル
- ダイアログ候補
- aria属性
- required / disabled / readonly
- selector候補
- data-testid

### 21.2.2 実画面を見ながら仕様把握できるため

テスト設計では、仕様書だけではなく、実際の画面から分かる情報も多い。

Chrome拡張のサイドパネルを使うことで、テスト対象画面と設計アプリを並べて作業できる。

```text
┌──────────────────────────────┬──────────────────────────────┐
│ テスト対象Webアプリ           │ Test Design Studio Extension │
│                              │                              │
│ ユーザー一覧画面              │ 現在画面: /users             │
│ - 検索フォーム                │ [現在画面を解析]              │
│ - 一覧テーブル                │ [UI選択モード]                │
│ - 作成ボタン                  │ [候補をUIツリーに追加]        │
│                              │ [既存UIの変更として登録]      │
└──────────────────────────────┴──────────────────────────────┘
```

### 21.2.3 既存UI変更を扱うため

実務では、新規UIよりも既存UIの仕様変更が多い。

例:

- 既存入力欄が任意から必須に変わる
- 既存ボタンの文言が変わる
- 既存ボタンの活性条件が変わる
- 既存ダイアログに項目が追加される
- 既存フローの遷移先が変わる
- 既存エラー文言が変わる

Chrome拡張で現在DOMを取得し、既存UI定義と比較することで、変更候補を登録できる。

---

## 21.3 採用する方式

### 採用方式

MVPでは、以下を採用する。

```text
Chrome拡張 Side Panel
  └── 拡張機能に同梱したReactアプリを表示する

Content Script
  └── テスト対象ページのDOMを解析する

Background Service Worker
  └── Side PanelとContent Scriptの通信・タブ制御を行う
```

### 採用しない方式

MVPでは、以下を主方式にしない。

```text
テスト対象ページ内にiframeを注入し、
外部Webアプリをそのまま開く方式
```

理由は以下である。

- iframe表示はCSPやX-Frame-Optionsに影響される
- Webアプリ版とChrome拡張版でIndexedDBのoriginが異なる
- リモートWebアプリからChrome拡張APIを直接扱いづらい
- テスト対象ページのレイアウトを壊す可能性がある
- Chrome拡張の審査・セキュリティ上、拡張ロジックは拡張パッケージ内に置く方が安全

### 補助的に将来検討する方式

以下は将来の補助機能として検討可能。

```text
- テスト対象ページ上に一時的なハイライト枠を表示する
- 登録済みUIにバッジを表示する
- 差分ありUIをページ上で強調する
- 選択中UIに小さなオーバーレイを出す
```

ただし、MVPではテスト対象DOMを破壊的に変更しない。

---

## 21.4 Web版とChrome拡張版の関係

Web版とChrome拡張版は、別々に作るのではなく、**同じコアを使う別入口**として設計する。

```text
apps/
  web/
    通常Webアプリ版

  chrome-extension/
    sidepanel
    background service worker
    content script

packages/
  core/
    型定義
    Dexie schema
    import/export
    traceability logic
    test design domain logic

  ui/
    共通UIコンポーネント

  extractor/
    DOM解析
    selector生成
    UI候補生成
```

### 共有するもの

```text
- データモデル
- Dexieスキーマ
- JSON import/export
- Markdown/CSV出力
- テスト観点・ケース管理ロジック
- UIコンポーネント
- 変更履歴管理ロジック
- トレーサビリティ管理ロジック
```

### Chrome拡張版だけが持つもの

```text
- sidePanel
- background service worker
- content script
- DOM解析
- UI選択モード
- 現在タブ情報取得
- 要素ハイライト
- selector候補生成
```

---

## 21.5 データ保存と同期方針

### MVPではJSON同期を採用する

MVPではクラウド同期を入れない。Web版とChrome拡張版は、JSONエクスポート/インポートで連携する。

```text
Chrome拡張版:
chrome-extension://<extension-id> の IndexedDB

Web版:
https://app.example.com の IndexedDB

連携:
JSON export / JSON import
```

### 想定フロー

#### 拡張版でキャプチャしてWeb版へ移す

```text
1. Chrome拡張サイドパネルで実画面からUIをキャプチャする
2. 拡張版IndexedDBに保存する
3. JSONエクスポートする
4. Web版にJSONインポートする
5. PC画面で詳細な仕様把握・テスト設計を行う
```

#### Web版で作った設計を拡張版へ移す

```text
1. Web版で機能・画面・UIツリーを設計する
2. JSONエクスポートする
3. Chrome拡張版にインポートする
4. 実画面を見ながらUI差分を確認する
5. 既存UIの変更として登録する
```

### 後回しにする同期

以下はMVP後に検討する。

```text
- Cloudflare Workersによる同期API
- D1 / R2 / Durable Objectsへの保存
- ログイン
- 暗号化
- 競合解決
- 複数端末同期
- チーム共有
```

---

## 21.6 DOMキャプチャ機能

## 21.6.1 現在画面解析

サイドパネルから「現在画面を解析」を実行すると、content scriptが現在ページの主要DOMを解析する。

取得対象は以下。

```text
- location.href
- document.title
- h1 / h2 / h3
- form
- input
- textarea
- select
- checkbox
- radio
- button
- a
- table
- dialog
- [role="dialog"]
- [role="alert"]
- [role="button"]
- [aria-label]
- [aria-invalid]
- [aria-required]
- [data-testid]
```

解析結果は即時に確定保存せず、**候補**として表示する。

---

## 21.6.2 UI選択モード

UI選択モードでは、ユーザーがテスト対象ページ上のDOMを直接選択できる。

### 操作フロー

```text
1. サイドパネルで「UI選択モード」をONにする
2. content scriptが選択モードを開始する
3. hover中の要素を一時的にハイライトする
4. ユーザーが対象要素をクリックする
5. content scriptが対象要素の情報を抽出する
6. side panelに候補として送信する
7. ユーザーが登録方法を選択する
```

### 登録方法

```text
- 新規UIとして追加
- 既存UIに紐づけ
- 既存UIの変更として登録
- 無視
```

### 注意

UI選択モードでは、テスト対象アプリのDOMを恒久的に変更しない。行うのは、ハイライト表示、選択、情報抽出のみとする。

---

## 21.7 抽出するDOM情報

選択した要素から、以下を抽出する。

| 項目 | 内容 |
|---|---|
| tagName | input, button, select など |
| inputType | text, email, password など |
| role | ARIA role |
| text | 表示テキスト |
| label | label要素から推定した名称 |
| ariaLabel | aria-label |
| placeholder | placeholder |
| required | required / aria-required |
| disabled | disabled / aria-disabled |
| readonly | readonly |
| invalid | aria-invalid |
| id | id属性 |
| name | name属性 |
| className | class属性 |
| testId | data-testid |
| selectorCandidates | selector候補 |
| parentForm | 親form候補 |
| parentDialog | 親dialog候補 |
| parentSection | 親section候補 |
| boundingBox | 画面上の位置 |
| pageUrl | 取得元URL |
| pageTitle | 取得元title |
| capturedAt | 取得日時 |

---

## 21.8 selector候補生成

Playwrightや手動確認に使えるよう、selectorHintを生成する。

優先順位は以下。

```text
1. data-testid
2. role + accessible name
3. label
4. placeholder
5. name属性
6. id属性
7. text
8. CSS selector
9. XPath相当の補助情報
```

ただし、MVPではselectorを完全保証しない。あくまで **selectorHint** として保存する。

---

## 21.9 DOM候補の登録UI

サイドパネルでは、抽出候補を以下のように表示する。

```text
選択中DOM:
メールアドレス入力欄

候補情報:
- nodeType: input
- role: input
- label: メールアドレス
- required: true
- disabled: false
- selectorHint: [data-testid="email-input"]
- parent: ユーザー作成フォーム候補

登録方法:
[新規UIとして追加]
[既存UIに紐づけ]
[既存UIの変更として登録]
[無視]
```

### 新規UIとして追加

- 画面を選ぶ
- 親UIノードを選ぶ
- nodeType / roleを確認する
- nameを編集する
- selectorHintを保存する
- データ種別を任意で紐づける

### 既存UIに紐づけ

- 既存UIノードを選択する
- selectorHintを更新する
- DOMスナップショットを保存する
- captureSourceを保存する

### 既存UIの変更として登録

- 既存UIノードを選択する
- 変更種別を選ぶ
- 変更前/変更後を記録する
- 影響する観点・ケースを手動で紐づける
- ChangeRecordを作成する

---

## 21.10 既存UIとの差分登録

DOM候補と既存UIノードを比較し、変更候補を登録できるようにする。

### 例

```text
既存UI:
メールアドレス入力欄

検出差分:
- required: false → true
- placeholder: "メール" → "メールアドレス"

変更登録:
- 変更種別: validationChanged / labelChanged
- 変更前: 任意入力
- 変更後: 必須入力
- 影響: 必須エラー観点、同値分割、保存フロー
```

### MVPで扱う差分種別

```text
labelChanged
selectorChanged
validationChanged
visibilityConditionChanged
enabledConditionChanged
nodeTypeChanged
roleChanged
added
removed
```

### 重要方針

自動差分検出は、MVPでは完璧でなくてよい。ただし、**変更として登録できること** は必須とする。

---

## 21.11 Chrome拡張MVPの画面

### Side Panel Home

- 現在タブのURL
- 現在画面タイトル
- 対象プロジェクト選択
- 対象画面選択
- 現在画面を解析
- UI選択モード開始
- 最近のキャプチャ候補

### DOM Candidate Review

- 抽出候補一覧
- nodeType / role / label / selectorHint
- 新規追加
- 既存UI紐づけ
- 変更登録
- 無視

### Element Picker Result

- 選択要素の詳細
- 親候補
- selector候補
- 属性情報
- 登録操作

### Change Registration

- 既存UI選択
- 変更種別
- 変更前
- 変更後
- 変更理由
- 影響メモ
- 関連観点・ケース選択

---

## 21.12 Chrome拡張MVP受け入れ基準

```text
1. Chrome拡張のSide Panelを開ける
2. Side Panel上でTest Design Studioの拡張版UIを表示できる
3. 現在タブのURLとtitleを取得できる
4. content scriptを現在タブに注入できる
5. 現在ページの主要DOMを解析できる
6. form/input/button/select/table/dialog候補を抽出できる
7. UI選択モードを開始・終了できる
8. hover中の要素を一時ハイライトできる
9. clickした要素の情報を抽出できる
10. 抽出候補をside panelに表示できる
11. 候補を新規UIとして登録できる
12. 候補を既存UIに紐づけできる
13. 候補を既存UIの変更として登録できる
14. selectorHintを保存できる
15. captureSourceとしてURL、capturedAt、captureMethodを保存できる
16. 登録内容をIndexedDBに保存できる
17. JSON export/importでWeb版と互換できる
18. DOMキャプチャ由来の変更をChangeRecordとして残せる
19. 変更が影響する観点・テストケースを手動で紐づけられる
20. テスト対象DOMを破壊的に変更せずに利用できる
```

---

## 21.13 Chrome拡張の権限方針

MVPでは、権限を強くしすぎない。

基本方針。

```json
{
  "permissions": [
    "sidePanel",
    "activeTab",
    "scripting",
    "storage"
  ]
}
```

### 方針

- `activeTab` を基本にする
- ユーザーが明示的に操作した現在タブだけ解析する
- `<all_urls>` は最初から広く要求しない
- 社内利用や特定ドメイン利用が固まったらhost_permissionsを追加する
- 本番環境では破壊的操作を行わない

---

## 21.14 追加データモデル

### UiNodeへの追加項目

```ts
type UiNode = {
  id: string;
  projectId: string;
  screenId: string;
  parentId?: string | null;

  name: string;
  nodeType: string;
  role: string;

  selectorHint?: string;
  sourceUrl?: string;
  capturedAt?: string;
  captureMethod?: "manual" | "dom_scan" | "element_picker" | "import";

  domSnapshot?: {
    tagName?: string;
    role?: string;
    text?: string;
    ariaLabel?: string;
    label?: string;
    placeholder?: string;
    inputType?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    invalid?: boolean;
    id?: string;
    name?: string;
    testId?: string;
  };

  status: "active" | "deprecated" | "removed";
  createdAt: string;
  updatedAt: string;
};
```

### DomCaptureCandidate

```ts
type DomCaptureCandidate = {
  id: string;
  projectId: string;
  tabUrl: string;
  pageTitle?: string;
  screenId?: string;
  capturedAt: string;
  captureMethod: "dom_scan" | "element_picker";

  suggestedName?: string;
  suggestedNodeType?: string;
  suggestedRole?: string;
  selectorCandidates: string[];

  domInfo: {
    tagName: string;
    text?: string;
    ariaLabel?: string;
    label?: string;
    placeholder?: string;
    inputType?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    invalid?: boolean;
    id?: string;
    name?: string;
    testId?: string;
  };

  parentCandidates?: {
    form?: string;
    dialog?: string;
    section?: string;
  };

  status: "pending" | "added" | "linked" | "change_registered" | "ignored";
};
```

### ChangeRecordへの追加

```ts
type ChangeRecord = {
  id: string;
  projectId: string;
  targetType:
    | "feature"
    | "screen"
    | "uiNode"
    | "dataType"
    | "entity"
    | "businessRule"
    | "state"
    | "flow"
    | "testViewpoint"
    | "testCase";

  targetId: string;

  changeType:
    | "added"
    | "updated"
    | "removed"
    | "renamed"
    | "moved"
    | "conditionChanged"
    | "behaviorChanged"
    | "validationChanged"
    | "selectorChanged"
    | "labelChanged"
    | "visibilityConditionChanged"
    | "enabledConditionChanged";

  beforeSummary?: string;
  afterSummary: string;
  reason?: string;
  source?: "manual" | "dom_capture" | "import";
  sourceUrl?: string;
  capturedAt?: string;
  confidence: "confirmed" | "tentative" | "assumed" | "unknown";
  impactNotes?: string;
  createdAt: string;
};
```

---

## 21.15 Dexieテーブル追加

```ts
db.version(2).stores({
  domCaptureCandidates:
    "id, projectId, screenId, tabUrl, capturedAt, captureMethod, status"
});
```

既存の `uiNodes` と `changeRecords` には、DOMキャプチャ由来の情報を保存できる項目を追加する。

---

## 21.16 改訂後の実装フェーズ

### Phase 1: 共通コア

```text
- 型定義
- Dexieスキーマ
- JSON import/export
- Project / Feature / Screen / UiNode
- State / DataType / Flow / TestViewpoint / TestCase
```

### Phase 2: Webアプリ基本UI

```text
- 通常Webアプリとして編集できる
- UIツリーを手入力できる
- テスト設計情報を保存できる
- Markdown / CSV / JSON出力できる
```

### Phase 3: Chrome拡張MVP

```text
- Manifest V3
- sidePanel
- background service worker
- content script
- DOM scan
- Element Picker
- hoverハイライト
- DOM候補レビュー
- 候補取り込み
- 既存UI変更登録
```

### Phase 4: テスト設計統合

```text
- DOM候補からUIツリーに登録
- UIからデータ種別・状態・観点に接続
- 変更から影響観点を登録
- JSONでWeb版と往復
```

### Phase 5: 拡張

```text
- Cloudflare同期
- AI補助
- Playwrightコード生成
- GitHub/Jira連携
- Figma/Notion連携
```

---

## 21.17 Chrome拡張MVPでやらないこと

MVPでは以下をやらない。

```text
- DOMから完全な仕様書を自動生成する
- DOMから完全なテストケースを自動生成する
- テスト対象アプリのDOMを破壊的に編集する
- テスト対象アプリの状態を勝手に変更する
- Web版とリアルタイム同期する
- クラウド保存を前提にする
- closed shadow DOMやcanvas UIを無理に解析する
- クロスオリジンiframe内部を無理に解析する
- Reactコンポーネント名を自動取得する
```

---

## 21.18 改訂後の最終MVP定義

改訂後のMVPは以下とする。

> Webアプリで仕様把握・テスト設計を行い、Chrome拡張サイドパネルで実画面からUI構造と変更差分をキャプチャできる。保存はIndexedDB、Web版との連携はJSON export/importで行う。

このMVPにより、以下が可能になる。

```text
- 仕様を手入力で構造化できる
- 実画面からUI構造を取り込める
- 新規UIを登録できる
- 既存UIにDOM情報を紐づけられる
- 既存UIの仕様変更をChangeRecordとして登録できる
- 変更影響をテスト観点・ケースへ接続できる
- Markdown / CSV / JSONで業務利用できる
```
