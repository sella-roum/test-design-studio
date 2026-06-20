import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Test Design Studio</h1>
      </header>
      <main className="app-main">
        <div className="welcome">
          <h2 className="welcome-heading">ローカルファーストなテスト設計ワークスペース</h2>
          <p className="welcome-description">
            仕様把握、UI構造、データ条件、業務ルール、テスト観点、テストケース、
            変更履歴、トレーサビリティを構造化して扱います。
          </p>
          <div className="empty-state">
            <p className="empty-state-text">
              プロジェクトを作成して、テスト設計を始めましょう。
            </p>
            <p className="empty-state-hint">
              Project管理画面は Phase 3 で実装予定です。
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
