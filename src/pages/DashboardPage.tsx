import { EmptyState } from '../components/common/EmptyState';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">ダッシュボード</h1>
          <p className="page-description">テスト設計ワークスペースの概要</p>
        </div>
      </div>
      <EmptyState
        title="Test Design Studio へようこそ"
        description="プロジェクトを作成して、機能・画面・テスト観点・テストケースを整理しましょう。"
        action={
          <Link to="/projects" className="btn btn-primary">
            プロジェクト一覧へ
          </Link>
        }
      />
    </div>
  );
}
