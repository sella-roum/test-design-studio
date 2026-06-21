import type { Project } from '../../lib/models/project';
import { Badge } from '../common/Badge';

type ProjectTableProps = {
  projects: Project[];
  onSelect: (id: string) => void;
  onEdit: (project: Project) => void;
  onRemove: (project: Project) => void;
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

export function ProjectTable({ projects, onSelect, onEdit, onRemove }: ProjectTableProps) {
  if (projects.length === 0) return null;

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
            <th>プロジェクト名</th>
            <th>説明</th>
            <th>状態</th>
            <th>更新日時</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              tabIndex={0}
              role="button"
              aria-label={`${p.name} を開く`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(p.id)}
              onKeyDown={(e) => handleKeyDown(e, p.id)}
            >
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.description || '-'}
              </td>
              <td>
                <Badge variant={p.status} />
              </td>
              <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(p.updatedAt)}
              </td>
              <td className="actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(p)}>
                  編集
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => onRemove(p)}
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
