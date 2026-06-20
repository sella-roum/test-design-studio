# App Shell and Navigation UI Spec

## Purpose

App Shellは、Test Design Studio全体の共通レイアウトを定義する。

P0では、実装対象画面が増えても利用者が現在位置を見失わないこと、Feature Workspaceへ最短で戻れること、Project / Feature / Exportの導線が明確であることを優先する。

## Global layout

```text
┌────────────────────────────────────────────┐
│ Top Header                                  │
├──────────────┬─────────────────────────────┤
│ Sidebar      │ Main Content                 │
│              │                             │
│              │                             │
└──────────────┴─────────────────────────────┘
```

## AppShell responsibilities

- Sidebarを常時表示する。
- Top Headerを常時表示する。
- Main Contentにroute単位の画面を表示する。
- Project / Featureの現在コンテキストを子画面に渡せる構造にする。
- 画面全体のloading / error boundaryを受け止める。

## Sidebar

### Purpose

Sidebarは、グローバルナビゲーションとして機能する。

ただし、P0ではサイドバーにすべての詳細管理画面を実装しない。多くの編集はFeature Workspace内のタブで行う。

### Menu items

| メニュー         | Route                                                       |      P0 | 備考                                |
| ---------------- | ----------------------------------------------------------- | ------: | ----------------------------------- |
| ダッシュボード   | `/`                                                         |    必須 | Project横断の簡易入口               |
| プロジェクト     | `/projects`                                                 |    必須 | Project一覧・作成                   |
| 機能             | `/projects/:projectId`                                      |    必須 | Project内Feature一覧                |
| 画面 / UI        | Feature Workspace tab                                       |    任意 | P0では直接routeを持たなくてよい     |
| データ / ルール  | Feature Workspace tab                                       |    任意 | P0では直接routeを持たなくてよい     |
| 未確認事項       | Feature Workspace tab                                       |    任意 | P0では直接routeを持たなくてよい     |
| テスト観点       | Feature Workspace tab                                       |    必須 | Feature Workspace内で編集           |
| テストケース     | Feature Workspace tab                                       |    必須 | Feature Workspace内で編集           |
| トレーサビリティ | `/projects/:projectId/features/:featureId?tab=traceability` |  非対象 | Phase 7で簡易表示。P0では準備中表示 |
| エクスポート     | `/projects/:projectId/export`                               | Phase 4 | Phase 3では導線または準備中         |
| 設定             | `/settings`                                                 |  非対象 | P0では実装しない                    |

### Active state

- 現在のrouteに応じて1項目だけPrimary activeにする。
- Feature Workspace内のタブはSidebarではなく、Workspace内Tabでactive表示する。
- Project未選択時はProject依存メニューをdisabledまたは非表示にする。

### Recent projects

P1以降で、Sidebar下部に最近開いたProjectを表示してよい。

P0では必須ではない。実装する場合も、localStorageに最後に開いたProject IDを保持する程度に留める。

## Top Header

### Purpose

Top Headerは、現在画面に共通する補助導線を提供する。

P0では検索や通知を作り込みすぎない。

### Elements

| 要素                     |     P0 | 内容                                  |
| ------------------------ | -----: | ------------------------------------- |
| Product name             |   必須 | `Test Design Studio`                  |
| Global search            |   任意 | P0ではdisabledまたはplaceholderでよい |
| Notification icon        | 非対象 | P0では表示しないかplaceholder         |
| User avatar              | 非対象 | 認証がないため固定表示または非表示    |
| Current project switcher |   任意 | Project選択後の補助導線               |

## Breadcrumb

BreadcrumbはProject / Feature / Editor画面で表示する。

### Examples

```text
Projects > AILEAD Web App
Projects > AILEAD Web App > Login / Authentication
Projects > AILEAD Web App > Login / Authentication > VP-001
```

## PageHeader

各主要画面はPageHeaderを持つ。

### Required elements

- Title
- Optional description
- StatusBadge
- Primary action
- Secondary actions
- UpdatedAtまたは補足メタ情報

### Example

```text
Login / Authentication    [active]
ユーザー認証、MFA、アカウントロックを含むログイン機能

[Featureを編集] [Export] [...]
```

## Main content width

P0はDesktop firstとし、Main Contentは次を想定する。

| 用途           | 推奨                                   |
| -------------- | -------------------------------------- |
| 最大幅固定画面 | Project一覧、Export                    |
| 横幅いっぱい   | Feature Workspace、Traceability Matrix |
| 最小幅         | 1280px                                 |

## Routing policy

P0で必要なrouteは次の通り。

```text
/
/projects
/projects/:projectId
/projects/:projectId/features/:featureId
/projects/:projectId/export
```

`/settings`、`/capture-review`、`/ai-export` はP0で追加しない。

## Navigation behavior

### Project not selected

- `/projects` を起点にする。
- Project依存画面へ直接アクセスされた場合、Not FoundまたはProject selection requiredを表示する。

### Feature not found

- Feature Workspaceで対象Featureが存在しない場合は、Project Dashboardへ戻る導線を表示する。

### Deleted or removed entity

- `status: removed` のEntityは通常一覧から除外する。
- 参照上必要な場合は `removed` badgeを付けて表示する。

## Non-goals

P0では次を実装しない。

- 認証ユーザーごとのメニュー制御
- 権限管理
- 通知センター
- 複雑なグローバル検索
- Command palette
- モバイル用ナビゲーション
