import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

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
      message = error.data?.message ?? message;
    }
  } else if (error instanceof Error) {
    message = error.message;
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
