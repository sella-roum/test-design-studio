# AGENTS.md

このリポジトリで作業するAIエージェント向けのルート指示です。詳細な実装計画は `docs/plans/`、プロダクト設計は `docs/design.md`、分割仕様は `docs/specs/` を参照してください。

## 基本方針

Test Design Studio は、テスト対象アプリケーションの仕様把握、UI構造、データ、業務ルール、テスト観点、テストケース、変更履歴、トレーサビリティを構造化して扱うローカルファーストなテスト設計ワークスペースです。

ただし、`docs/design.md` は長期構想を含む親設計書です。1回のPRで全体を実装してはいけません。

## 参照優先度

実装判断に迷った場合は、次の優先度で参照してください。

1. `AGENTS.md`
2. `docs/agents/coding-instructions.md`
3. 現在対応する `docs/plans/tasks/*.md` の `Scope / Non-goals / Acceptance criteria`
4. `docs/plans/task-breakdown.md`
5. `docs/plans/implementation-plan.md`
6. 対象領域の `docs/specs/*.md`
7. `docs/design.md`

矛盾した場合は、原則として **現在対応する詳細タスク > 対象領域の仕様書 > 親設計書** の順で優先してください。

`docs/design.md` に書かれていても、現在の詳細タスクに含まれないものや `Non-goals` に含まれるものは実装しません。

## 作業ルール

- 1PRでは原則として1つのフェーズだけを扱う。
- フェーズ内の複数Taskをまとめて実装してよい。ただし、PR本文に含めたTask ID、Scope、Non-goals、検証結果を明記する。
- `Scope` に書かれていない機能をついでに実装しない。
- `Non-goals` に書かれている内容は実装しない。
- 実装前に、該当する仕様書とタスク文書を確認する。
- UIだけ、型だけ、保存処理だけで終わる中途半端な変更を避ける。
- ドメインモデルを変更する場合は、関連する保存層、export/import、テストへの影響を確認する。
- DexieのschemaVersionを変更する場合は、migration方針を明記する。
- Chrome拡張はテスト対象ページのDOMや業務データを破壊的に変更しない。
- DOM解析およびAccessibility Tree解析は入力補助であり、仕様の完全自動生成として扱わない。
- Accessibility Tree由来のrole、accessible name、stateは、`UiNode` 候補の補助情報として扱い、利用者の確認なしに正本化しない。
- `chrome.debugger` permissionを使うAccessibility Tree取得は、対象タスクで明示されている場合のみ実装する。

## 実装スタイル

- TypeScriptで型を明示する。
- UIコンポーネント、ドメイン型、Repository層を分離する。
- 永続化処理はRepository経由にし、UIからDexieを直接呼ばない。
- ID、status、timestamps、schemaVersionの扱いを統一する。
- 仕様上の未確定事項は実装で決め打ちせず、TODOではなくドキュメントに明記する。

## テスト方針

- ドメインロジックとRepository層には最低限のテストを追加する。
- export/import、trace link、change impactなど、後から壊れやすい機能はテスト対象にする。
- Chrome拡張のDOM取得は、可能な範囲で純粋関数化して単体テスト可能にする。
- Accessibility Tree取得を実装する場合も、AX node正規化、redaction、DOM/AX対応付けを純粋関数化してテスト可能にする。

## PR作成時の必須確認

PR本文には、次の内容を必ず含めてください。

- 対応したTask ID
- 実装したScope
- 実装しなかったNon-goals
- 変更ファイル
- 動作確認結果
- 未対応事項または次PRへの引き継ぎ

## 禁止事項

- 親設計書に書かれている将来機能を無断で先取りしない。
- AI生成、Playwright生成、クラウド同期、Figma/Notion/Jira/GitHub連携を初期フェーズで実装しない。
- localStorageだけで長期データを保存しない。
- DOMやAccessibility Treeから業務ルールや期待結果を確定仕様として自動登録しない。
- 仕様の根拠がない状態でテストケースを大量生成しない。
