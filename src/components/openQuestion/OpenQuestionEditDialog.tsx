import { useState } from 'react';
import type { OpenQuestion, OpenQuestionStatus } from '../../lib/models/openQuestion';
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

type OpenQuestionEditDialogProps = {
  openQuestion: OpenQuestion;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      question?: string;
      context?: string;
      answer?: string;
      questionStatus?: OpenQuestionStatus;
      confidence?: Confidence;
    },
  ) => Promise<OpenQuestion>;
};

export function OpenQuestionEditDialog({
  openQuestion,
  onUpdated,
  onCancel,
  onUpdate,
}: OpenQuestionEditDialogProps) {
  const [question, setQuestion] = useState(openQuestion.question);
  const [context, setContext] = useState(openQuestion.context ?? '');
  const [answer, setAnswer] = useState(openQuestion.answer ?? '');
  const [questionStatus, setQuestionStatus] = useState<OpenQuestionStatus>(
    openQuestion.questionStatus,
  );
  const [confidence, setConfidence] = useState<Confidence>(openQuestion.confidence);
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
      await onUpdate(openQuestion.id, {
        question: question.trim(),
        context: context.trim() || undefined,
        answer: answer.trim() || undefined,
        questionStatus,
        confidence,
      });
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="dialog-header">
            <h3 className="dialog-title">未確定事項を編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="oq-edit-question">
                質問 <span className="label-optional">(必須)</span>
              </label>
              <textarea
                id="oq-edit-question"
                className="input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="oq-edit-context">
                コンテキスト <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="oq-edit-context"
                className="input"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="oq-edit-answer">
                回答 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="oq-edit-answer"
                className="input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="回答が得られた場合に入力"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="oq-edit-status">
                  状態
                </label>
                <select
                  id="oq-edit-status"
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
                <label className="label" htmlFor="oq-edit-confidence">
                  確信度
                </label>
                <select
                  id="oq-edit-confidence"
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
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
