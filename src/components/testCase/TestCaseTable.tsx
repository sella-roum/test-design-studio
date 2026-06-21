import { useMemo } from 'react';
import type { TestCase } from '../../lib/models/testCase';

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

type TestCaseTableProps = {
  testCases: TestCase[];
  viewpoints: { id: string; title: string }[];
  onEdit: (tc: TestCase) => void;
  onRemove: (tc: TestCase) => void;
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

export function TestCaseTable({ testCases, viewpoints, onEdit, onRemove }: TestCaseTableProps) {
  const viewpointMap = useMemo(
    () => new Map(viewpoints.map((vp) => [vp.id, vp.title])),
    [viewpoints],
  );

  if (testCases.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>タイトル</th>
            <th>テスト観点</th>
            <th>ステップ数</th>
            <th>優先度</th>
            <th>自動化適性</th>
            <th>更新日時</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((tc) => (
            <tr key={tc.id}>
              <td style={{ fontWeight: 600 }}>{tc.title}</td>
              <td>{tc.viewpointId ? (viewpointMap.get(tc.viewpointId) ?? '-') : '-'}</td>
              <td>
                <span className="badge badge-count">{tc.steps.length}</span>
              </td>
              <td>
                {tc.priority ? (
                  <span className={`badge badge-${tc.priority}`}>
                    {PRIORITY_LABELS[tc.priority] ?? tc.priority}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {tc.automationSuitability ? (
                  <span className={`badge badge-${tc.automationSuitability}`}>
                    {AUTOMATION_LABELS[tc.automationSuitability] ?? tc.automationSuitability}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(tc.updatedAt)}
              </td>
              <td className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(tc)}>
                  編集
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => onRemove(tc)}
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
