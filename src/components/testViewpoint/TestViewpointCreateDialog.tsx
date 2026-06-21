import { useState } from 'react';
import type { TestTechnique } from '../../lib/models/testViewpoint';
import type { Priority, AutomationSuitability } from '../../lib/types';

const TECHNIQUE_OPTIONS: { value: TestTechnique | ''; label: string }[] = [
  { value: '', label: '指定なし' },
  { value: 'equivalence', label: '同値分割' },
  { value: 'boundary', label: '境界値' },
  { value: 'state-transition', label: '状態遷移' },
  { value: 'decision-table', label: 'デシジョンテーブル' },
  { value: 'use-case', label: 'ユースケース' },
  { value: 'exploratory', label: '探索的' },
];

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

type TestViewpointCreateDialogProps = {
  onCreated: (id: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    title: string;
    description?: string;
    technique?: TestTechnique;
    priority?: Priority;
    automationSuitability?: AutomationSuitability;
    automationReason?: string;
  }) => Promise<{ id: string }>;
};

export function TestViewpointCreateDialog({
  onCreated,
  onCancel,
  onCreate,
}: TestViewpointCreateDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technique, setTechnique] = useState<TestTechnique | ''>('');
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
      const vp = await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        technique: technique || undefined,
        priority: priority || undefined,
        automationSuitability: automationSuitability || undefined,
        automationReason: automationReason.trim() || undefined,
      });
      onCreated(vp.id);
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
            <h3 className="dialog-title">新規テスト観点</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="vp-title">
                タイトル <span className="label-optional">(必須)</span>
              </label>
              <input
                id="vp-title"
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 入力値のバリデーション"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="vp-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="vp-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="観点の詳細"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="vp-technique">
                  テスト技法
                </label>
                <select
                  id="vp-technique"
                  className="select"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value as TestTechnique | '')}
                >
                  {TECHNIQUE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="vp-priority">
                  優先度
                </label>
                <select
                  id="vp-priority"
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
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="vp-automation">
                  自動化適性
                </label>
                <select
                  id="vp-automation"
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
              <div className="form-group">
                <label className="label" htmlFor="vp-auto-reason">
                  自動化理由 <span className="label-optional">(任意)</span>
                </label>
                <input
                  id="vp-auto-reason"
                  className="input"
                  type="text"
                  value={automationReason}
                  onChange={(e) => setAutomationReason(e.target.value)}
                />
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
