# Glossary

この文書は、Test Design Studio の主要用語を定義する。実装者とAIエージェントは、用語の意味が曖昧な場合にこの文書を参照する。

## Project

テスト対象アプリケーションやプロダクト単位の最上位コンテナ。

例: 議事録SaaS、管理画面、予約システム。

## Feature

業務上意味のある機能単位。P0ではユースケース情報もFeatureに保持する。

例: ログイン、ユーザー管理、検索、予約作成。

## UseCase

利用者が目的を達成するための一連の利用シナリオ。P0では独立モデルにせず、Featureのpurpose、actor、preconditions、successCriteria、failureConditionsで表現する。

## Screen

Featureに関連する画面。URL、画面種別、目的、前提条件を持つ。

## UiNode

テスト設計上意味のあるUI要素。DOMノードの完全コピーではない。

例: メールアドレス入力欄、ログインボタン、エラーメッセージ、検索フォーム、一覧テーブル。

## DataEntity

業務データのまとまり。

例: User、Contract、Reservation、Comment。

## DataField

DataEntityの個別項目。

例: User.email、User.role、Reservation.startDate。

## DataType

入力値や値域の性質。

例: Email、Password、Date、Amount、Enum。

## BusinessRule

業務ルール、バリデーション、権限制御、表示条件、保存条件、エラー、例外を表す。

## OpenQuestion

未確認事項、仮説、要確認の仕様を表す。確定仕様と混ぜず、質問・背景・回答・状態・確度を保持する。

## TestViewpoint

テストケースの前段となる観点。何を確認すべきかを表す。

例: 無効なメールアドレスではログインできないこと、権限がないユーザーは管理画面を開けないこと。

## TestCase

具体的な確認手順と期待結果。P0から構造化されたTestStepを持つ。

## TestStep

TestCase内の1手順。操作種別、対象UiNode、手順説明、手順ごとの期待結果、テストデータを持つ。

## TraceLink

仕様要素、観点、ケース、変更履歴、根拠の関係を表す有向リンク。`linkType` によって関係の意味を明確にする。

## ChangeRecord

仕様、UI、業務ルール、観点、ケースなどの変更履歴。

## DomCaptureCandidate

Chrome拡張から取得したDOM情報の候補。仕様の正本ではなく、ユーザーが確認・編集してからUiNodeへ変換する。

## Evidence

仕様判断の根拠。仕様書、Figma、Notion、Slack、MTG、実装観察などを表す。

## State

画面、UI、フォーム、データなどの状態。P0では予約モデル。

## StateTransition

ある状態から別の状態へ変わる条件やイベント。P2の状態遷移テストで利用する。

## Flow

業務フロー全体。P0では予約モデル。

## FlowStep

業務フロー内の1手順。

## ErrorCase

エラー・例外を独立管理するための予約モデル。P0ではBusinessRuleの `error` / `exception` で表現してよい。

## DecisionTable

条件とアクションの組み合わせを整理するための表。P2の技法ワークベンチで利用する。

## ViewpointCandidate

技法ワークベンチが生成する観点候補。自動採用せず、利用者がレビューしてTestViewpointへ変換する。

## P0: Web Design MVP

Webアプリ単体で、1機能分の仕様把握、観点、ケース、Markdown/JSON出力までを成立させる段階。

## P1: Capture & Trace MVP

Chrome拡張、DomCaptureCandidate、ChangeRecord、TraceLink UI、影響候補表示を追加する段階。

## P2: Assistive Design MVP

技法ワークベンチ、AI context export、Playwright draft exportを追加する段階。
