# UI Design System Spec

## Purpose

Test Design Studio のUIは、テスト設計情報を構造化し、関連を見失わずに編集するためのB2B SaaS型ワークスペースとして設計する。

見た目の優先順位は、装飾性よりも情報の読み取りやすさ、関係性の把握、編集導線の明確さを上位に置く。

## UI concept

### Concept name

QA Design Workspace SaaS

### Design keywords

- Business-oriented
- Clean SaaS
- Data-dense but readable
- Structured workspace
- Traceability-first
- Calm and credible

## Product-specific design principles

### 1. Feature Workspace first

このプロダクトの中心はDashboardではなくFeature Workspaceである。

Dashboardは入口と状況把握に留め、1機能分の仕様、画面、ルール、未確認事項、観点、ケースを編集する導線を最優先する。

### 2. Do not hide uncertainty

仕様が曖昧な状態をUI上で隠さない。

未確認事項はOpenQuestionとして明示し、Feature Workspace、TestViewpoint、TestCase、Exportの各所から確認できるようにする。

### 3. Make relationships visible

テスト観点やテストケースは単独の一覧ではなく、どのScreen、UiNode、DataType、BusinessRule、OpenQuestionから生まれたかを見えるようにする。

P0では本格的なTraceability専用UIを作らず、TestViewpoint作成時のsource element選択と、TestCase作成時のTestViewpoint紐づけで関係を保存できる構造にする。

### 4. Allow progressive detailing

最初からすべての項目入力を求めない。

Project、Feature、Screen、UiNode、TestViewpoint、TestCaseはいずれも最小項目で作成し、後から詳細化できるようにする。

### 5. Keep P0 practical

P0では、次を作り込みすぎない。

- 高度なDashboard
- 高度なTraceability Matrix
- Change impact analysis
- Chrome拡張Capture review
- AI assist UI
- Playwright code export UI

## Visual tone

| 項目 | 方針 |
|---|---|
| 基調 | 白、薄いグレー、濃紺、青アクセント |
| 印象 | 信頼感、整理、業務利用、分析的 |
| 余白 | ゆとりを持たせるが、業務画面として情報密度は確保する |
| 角丸 | カード、ボタン、入力欄は控えめな丸み |
| 影 | 立体感よりも階層表現のために弱く使う |
| 装飾 | 過度なグラデーションやイラストは使わない |

## Color tokens

```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-soft: #eff6ff;
  --color-sidebar: #0f172a;
  --color-sidebar-active: #1d4ed8;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f5f9;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  --color-success: #16a34a;
  --color-success-soft: #dcfce7;
  --color-warning: #d97706;
  --color-warning-soft: #fef3c7;
  --color-danger: #dc2626;
  --color-danger-soft: #fee2e2;
  --color-info: #0284c7;
  --color-info-soft: #e0f2fe;
}
```

## Layout tokens

| 用途 | 値 |
|---|---|
| App outer padding | 24px |
| Main section gap | 24px |
| Card padding | 16px |
| Form row gap | 12px |
| Table cell padding | 12px 16px |
| Sidebar width | 240px |
| Compact sidebar width | 72px |
| Workspace left panel | 280px - 360px |
| Workspace right panel | 320px - 400px |

## Radius tokens

| 用途 | 値 |
|---|---|
| Button | 8px |
| Input | 8px |
| Card | 12px |
| Dialog | 16px |
| Badge | 999px |

## Typography

| 用途 | サイズ | 補足 |
|---|---:|---|
| Page title | 24px | 画面タイトル |
| Feature title | 22px | Feature Workspaceの主タイトル |
| Section title | 18px | カード見出し |
| Body | 14px | 通常テキスト |
| Table body | 13px | 一覧・Matrix |
| Caption | 12px | 補足、メタ情報 |
| KPI number | 28px | Summary Cardの主要数値 |

## Badge variants

UIで表示する値はDomain Modelのenumを正とする。UI仕様だけで独自のenumを増やさない。

| 種類 | 用途 |
|---|---|
| StatusBadge | active / deprecated / removed |
| RiskBadge | high / medium / low |
| ConfidenceBadge | confirmed / assumed / unknown |
| QuestionStatusBadge | open / answered / deferred / not_applicable |
| AutomationBadge | high / medium / low / manual-only |
| LinkTypeBadge | covers / derived_from / impacts / depends_on |

未判断の自動化適性は `automationSuitability` を未設定として扱い、`unknown` という保存値は使わない。

## Common states

すべての主要画面とデータ表示コンポーネントは、次の状態を持つ。

| 状態 | 表示方針 |
|---|---|
| loading | Skeletonを表示する |
| empty | 次に取るべき主要アクションを1つ明示する |
| error | 原因の要約とRetry導線を表示する |
| saving | 保存ボタンをloading状態にする |
| saved | Toastで保存完了を伝える |
| validation error | Field単位でエラーを表示する |
| not found | Project / Feature / Entityが存在しないことを明示する |

## Empty state principles

空状態では、単に「データがありません」と表示しない。

必ず次の要素を含める。

- 何がまだ存在しないのか
- なぜ作成する必要があるのか
- 最初に押すべきPrimary action
- 必要であればImportや後続Phaseへの導線

例:

```text
まだテスト観点がありません

この機能の画面、業務ルール、未確認事項をもとに、
まず確認すべき観点を作成しましょう。

[テスト観点を作成]
```

## Toast messages

| 種類 | 例 |
|---|---|
| success | 保存しました |
| error | 保存に失敗しました |
| warning | 未入力の必須項目があります |
| info | JSONをエクスポートしました |

## Desktop first

P0/P1はDesktop firstで設計する。

最低幅は1280pxを想定する。狭い画面での完全対応やモバイルUIは、初期MVPの対象外とする。
