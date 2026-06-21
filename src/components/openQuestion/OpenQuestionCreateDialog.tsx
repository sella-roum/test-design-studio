import { useState } from 'react';
import type { OpenQuestionStatus } from '../../lib/models/openQuestion';
import type { Confidence } from '../../lib/types';

const STATUS_OPTIONS: { value: OpenQuestionStatus; label: string }[] = [
  { value: 'open', label: '未回答' },
  { value: 'answered', label: '回答済' },
  { value: 'deferred', label: '先送り' },
  { value: 'not_applicable', label: '該当なし' },
];

const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: 'confirmed', label: '確定' },
  { value: 'tentative', label: '仮' },
  { value: 'assumed', label: '想定' },
  { value: 'unknown', label: '不明' },
];

type OpenQuestionCreateDialogProps = {
  onCreated: (id: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    question: string;
    context?: string;
    questionStatus: OpenQuestionStatus;
    confidence: Confidence;
  }) => Promise<{ id: string }>;
};

export function OpenQuestionCreateDialog({
  onCreated,
  onCancel,
  onCreate,
}: OpenQuestionCreateDialogProps) {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [questionStatus, setQuestionStatus] = useState<OpenQuestionStatus>('open');
  const [confidence, setConfidence] = useState<Confidence>('unknown');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('質問は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const oq = await onCreate({
        question: question.trim(),
        context: context.trim() || undefined,
        questionStatus,
        confidence,
      });
      onCreated(oq.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="dialog-header">
            <h3 className="dialog-title">新規未確定事項</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="oq-question">
                質問 <span className="label-optional">(必須)</span>
              </label>
              <textarea
                id="oq-question"
                className="input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例: パスワードの最小文字数は？"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="oq-context">
                コンテキスト <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="oq-context"
                className="input"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="背景や関連情報"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="oq-status">
                  状態
                </label>
                <select
                  id="oq-status"
                  className="select"
                  value={questionStatus}
                  onChange={(e) => setQuestionStatus(e.target.value as OpenQuestionStatus)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="oq-confidence">
                  確信度
                </label>
                <select
                  id="oq-confidence"
                  className="select"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as Confidence)}
                >
                  {CONFIDENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>
          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={saving}
            >
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
