import type { TestViewpoint } from '../../lib/models/testViewpoint';

const TECHNIQUE_LABELS: Record<string, string> = {
  equivalence: '同値分割',
  boundary: '境界値',
  'state-transition': '状態遷移',
  'decision-table': 'デシジョンテーブル',
  'use-case': 'ユースケース',
  exploratory: '探索的',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const AUTOMATION_LABELS: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
  'manual-only': '手動のみ',
};

type TestViewpointTableProps = {
  viewpoints: TestViewpoint[];
  testCaseCounts: Record<string, number>;
  onEdit: (vp: TestViewpoint) => void;
  onRemove: (vp: TestViewpoint) => void;
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

export function TestViewpointTable({
  viewpoints,
  testCaseCounts,
  onEdit,
  onRemove,
}: TestViewpointTableProps) {
  if (viewpoints.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>タイトル</th>
            <th>テスト技法</th>
            <th>優先度</th>
            <th>自動化適性</th>
            <th>テストケース数</th>
            <th>更新日時</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {viewpoints.map((vp) => (
            <tr key={vp.id}>
              <td style={{ fontWeight: 600 }}>{vp.title}</td>
              <td>
                {vp.technique ? (
                  <span className="badge badge-technique">
                    {TECHNIQUE_LABELS[vp.technique] ?? vp.technique}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {vp.priority ? (
                  <span className={`badge badge-${vp.priority}`}>
                    {PRIORITY_LABELS[vp.priority] ?? vp.priority}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {vp.automationSuitability ? (
                  <span className={`badge badge-${vp.automationSuitability}`}>
                    {AUTOMATION_LABELS[vp.automationSuitability] ?? vp.automationSuitability}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <span className="badge badge-count">{testCaseCounts[vp.id] ?? 0}</span>
              </td>
              <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(vp.updatedAt)}
              </td>
              <td className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(vp)}>
                  編集
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => onRemove(vp)}
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
