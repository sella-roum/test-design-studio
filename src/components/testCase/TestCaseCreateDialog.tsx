import { useState } from 'react';
import { StepTable, type StepRow } from './StepTable';
import type { Priority, AutomationSuitability } from '../../lib/types';

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: '指定なし' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const AUTOMATION_OPTIONS: { value: AutomationSuitability | ''; label: string }[] = [
  { value: '', label: '指定なし' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
  { value: 'manual-only', label: '手動のみ' },
];

type TestCaseCreateDialogProps = {
  onCreated: (id: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    title: string;
    viewpointId?: string;
    preconditions?: string;
    steps?: StepRow[];
    priority?: Priority;
    automationSuitability?: AutomationSuitability;
    automationReason?: string;
  }) => Promise<{ id: string }>;
  viewpointOptions?: { id: string; title: string }[];
};

export function TestCaseCreateDialog({
  onCreated,
  onCancel,
  onCreate,
  viewpointOptions,
}: TestCaseCreateDialogProps) {
  const [title, setTitle] = useState('');
  const [viewpointId, setViewpointId] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [priority, setPriority] = useState<Priority | ''>('');
  const [automationSuitability, setAutomationSuitability] = useState<AutomationSuitability | ''>(
    '',
  );
  const [automationReason, setAutomationReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const tc = await onCreate({
        title: title.trim(),
        viewpointId: viewpointId || undefined,
        preconditions: preconditions.trim() || undefined,
        steps: steps.length > 0 ? steps : undefined,
        priority: priority || undefined,
        automationSuitability: automationSuitability || undefined,
        automationReason: automationReason.trim() || undefined,
      });
      onCreated(tc.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog dialog-wide" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="dialog-header">
            <h3 className="dialog-title">新規テストケース</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="tc-title">
                タイトル <span className="label-optional">(必須)</span>
              </label>
              <input
                id="tc-title"
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 有効なメールアドレスで登録できる"
                autoFocus
              />
            </div>
            {viewpointOptions && viewpointOptions.length > 0 && (
              <div className="form-group">
                <label className="label" htmlFor="tc-viewpoint">
                  テスト観点 <span className="label-optional">(任意)</span>
                </label>
                <select
                  id="tc-viewpoint"
                  className="select"
                  value={viewpointId}
                  onChange={(e) => setViewpointId(e.target.value)}
                >
                  <option value="">指定なし</option>
                  {viewpointOptions.map((vp) => (
                    <option key={vp.id} value={vp.id}>
                      {vp.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="label" htmlFor="tc-preconditions">
                前提条件 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="tc-preconditions"
                className="input"
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
                placeholder="テスト実行前の状態"
              />
            </div>
            <div className="form-group">
              <StepTable steps={steps} onChange={setSteps} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="tc-priority">
                  優先度
                </label>
                <select
                  id="tc-priority"
                  className="select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority | '')}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="tc-automation">
                  自動化適性
                </label>
                <select
                  id="tc-automation"
                  className="select"
                  value={automationSuitability}
                  onChange={(e) =>
                    setAutomationSuitability(e.target.value as AutomationSuitability | '')
                  }
                >
                  {AUTOMATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="tc-auto-reason">
                自動化理由 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="tc-auto-reason"
                className="input"
                type="text"
                value={automationReason}
                onChange={(e) => setAutomationReason(e.target.value)}
              />
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
