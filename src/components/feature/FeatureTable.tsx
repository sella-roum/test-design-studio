import type { Feature } from '../../lib/models/feature';
import type { Screen } from '../../lib/models/screen';
import { Badge } from '../common/Badge';

type FeatureTableProps = {
  features: Feature[];
  screens: Screen[];
  onSelect: (id: string) => void;
  onEdit: (feature: Feature) => void;
  onRemove: (feature: Feature) => void;
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

export function FeatureTable({ features, screens, onSelect, onEdit, onRemove }: FeatureTableProps) {
  if (features.length === 0) return null;

  const getScreenCount = (featureId: string) =>
    screens.filter((s) => s.featureId === featureId).length;

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>機能名</th>
            <th>説明</th>
            <th>画面数</th>
            <th>状態</th>
            <th>更新日時</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr
              key={f.id}
              tabIndex={0}
              role="button"
              aria-label={`${f.name} を開く`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(f.id)}
              onKeyDown={(e) => handleKeyDown(e, f.id)}
            >
              <td style={{ fontWeight: 600 }}>{f.name}</td>
              <td
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.description || '-'}
              </td>
              <td>{getScreenCount(f.id)}</td>
              <td>
                <Badge variant={f.status} />
              </td>
              <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(f.updatedAt)}
              </td>
              <td className="actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => onSelect(f.id)}>
                  開く
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(f)}>
                  編集
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => onRemove(f)}
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
