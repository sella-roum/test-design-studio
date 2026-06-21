import type { Screen } from '../../lib/models/screen';
import { Badge } from '../common/Badge';

type ScreenTableProps = {
  screens: Screen[];
  onEdit: (screen: Screen) => void;
  onRemove: (screen: Screen) => void;
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const SCREEN_TYPE_LABELS: Record<string, string> = {
  list: '一覧',
  detail: '詳細',
  create: '作成',
  edit: '編集',
  confirm: '確認',
  complete: '完了',
  error: 'エラー',
  settings: '設定',
  login: 'ログイン',
  dashboard: 'ダッシュボード',
  admin: '管理',
  other: 'その他',
};

export function ScreenTable({ screens, onEdit, onRemove }: ScreenTableProps) {
  if (screens.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>画面名</th>
            <th>種別</th>
            <th>目的</th>
            <th>状態</th>
            <th>更新日時</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {screens.map((s) => (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.name}</td>
              <td>{s.screenType ? SCREEN_TYPE_LABELS[s.screenType] || s.screenType : '-'}</td>
              <td
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 250,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.purpose || '-'}
              </td>
              <td>
                <Badge variant={s.status} />
              </td>
              <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(s.updatedAt)}
              </td>
              <td className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(s)}>
                  編集
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => onRemove(s)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
