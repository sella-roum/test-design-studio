import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <h2>ページが見つかりません</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        お探しのページは存在しないか、移動しました。
      </p>
      <Link to="/projects" className="btn btn-primary">
        プロジェクト一覧へ戻る
      </Link>
    </div>
  );
}
