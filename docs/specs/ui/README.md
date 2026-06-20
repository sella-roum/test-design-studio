# UI Specification Index

このディレクトリは、Test Design Studio の画面仕様とUI設計方針を定義する。

`docs/specs/03-web-app-spec.md` はWebアプリの業務要件とP0/P1/P2の実装境界を定義する親仕様であり、このディレクトリはその下位にある画面単位の詳細仕様として扱う。

## 目的

UI仕様では、SaaS風の見た目を定義するだけではなく、QAエンジニアが1機能分の仕様把握、観点作成、テストケース作成、出力まで迷わず進められる作業導線を定義する。

特に次を重視する。

- Feature Workspaceを中心作業画面にする。
- Dashboardは状況把握と入口に留め、作り込みすぎない。
- TestViewpointとTestCaseは分けて扱い、相互リンクできるようにする。
- TraceabilityはP0では簡易表示に留め、P1以降でMatrix UIを強化する。
- Chrome拡張CaptureとAI支援はP0に含めない。
- Desktop firstで設計し、mobile対応は後続タスクに分離する。

## UI仕様一覧

| 文書 | 内容 |
|---|---|
| `01-ui-design-system.md` | UIコンセプト、デザイン原則、色、余白、状態表現 |
| `02-app-shell-navigation.md` | App Shell、Sidebar、Top Header、共通ナビゲーション |
| `03-project-dashboard-ui-spec.md` | Project Dashboard / Project Detail / Project List |
| `04-feature-workspace-ui-spec.md` | Feature Workspaceのレイアウト、ヘッダー、タブ、主要導線 |
| `05-test-design-editor-ui-spec.md` | TestViewpoint Editor / TestCase Editor / StepTable |
| `06-export-traceability-ui-spec.md` | Export画面、Traceability簡易表示、Matrix UI方針 |
| `07-ui-implementation-order.md` | UI実装順、P0/P1の分割、Taskとの対応 |

## 実装時の優先順位

1. App ShellとProject導線を作る。
2. Feature Workspaceの外枠を作る。
3. Screens / UI Tree、Data / Rules、Open Questionsを手入力できるようにする。
4. TestViewpointとTestCaseを作成できるようにする。
5. ExportをPhase 4で追加する。
6. TraceabilityとChange UIはPhase 7で強化する。

## 非対象

このUI仕様は、次を正本化しない。

- UIコンポーネントライブラリの最終選定
- 実装コードのディレクトリ構成
- Chrome拡張の詳細UI
- Accessibility Tree Captureの権限・取得仕様
- AI生成UI
- Playwright spec生成UI

これらは既存の各仕様書または後続タスクで扱う。
