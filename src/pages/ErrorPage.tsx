import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

function normalizeMessage(data: unknown): string | null {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object' && 'message' in data) {
    const msg = (data as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  return null;
}

export function ErrorPage() {
  const error = useRouteError();

  let title = '予期しないエラーが発生しました';
  let message = '申し訳ありません。問題が発生しました。時間をおいて再度お試しください。';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'ページが見つかりません';
      message = 'お探しのページは存在しないか、移動しました。';
    } else {
      title = `${error.status} - ${error.statusText}`;
      const normalized = normalizeMessage(error.data);
      if (normalized) message = normalized;
    }
  }

  return (
    <div className="error-page">
      <h1>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
      <Link to="/projects" className="btn btn-primary">
        プロジェクト一覧へ戻る
      </Link>
    </div>
  );
}
