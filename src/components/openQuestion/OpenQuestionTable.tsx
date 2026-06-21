import type { OpenQuestion } from '../../lib/models/openQuestion';

const STATUS_LABELS: Record<string, string> = {
  open: '未回答',
  answered: '回答済',
  deferred: '先送り',
  not_applicable: '該当なし',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  confirmed: '確定',
  tentative: '仮',
  assumed: '想定',
  unknown: '不明',
};

type OpenQuestionTableProps = {
  openQuestions: OpenQuestion[];
  onEdit: (oq: OpenQuestion) => void;
  onRemove: (oq: OpenQuestion) => void;
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

export function OpenQuestionTable({ openQuestions, onEdit, onRemove }: OpenQuestionTableProps) {
  if (openQuestions.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>質問</th>
            <th>状態</th>
            <th>確信度</th>
            <th>回答</th>
            <th>更新日時</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {openQuestions.map((oq) => (
            <tr key={oq.id}>
              <td
                style={{
                  fontWeight: 600,
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {oq.question}
              </td>
              <td>
                <span className={`badge badge-${oq.questionStatus}`}>
                  {STATUS_LABELS[oq.questionStatus] ?? oq.questionStatus}
                </span>
              </td>
              <td>
                <span className={`badge badge-${oq.confidence}`}>
                  {CONFIDENCE_LABELS[oq.confidence] ?? oq.confidence}
                </span>
              </td>
              <td
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {oq.answer || '-'}
              </td>
              <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(oq.updatedAt)}
              </td>
              <td className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(oq)}>
                  編集
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => onRemove(oq)}
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
