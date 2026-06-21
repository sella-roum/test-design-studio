import { useState } from 'react';
import type { TestViewpoint, TestTechnique } from '../../lib/models/testViewpoint';
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

type TestViewpointEditDialogProps = {
  viewpoint: TestViewpoint;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      title?: string;
      description?: string;
      technique?: TestTechnique;
      priority?: Priority;
      automationSuitability?: AutomationSuitability;
      automationReason?: string;
    },
  ) => Promise<TestViewpoint>;
};

export function TestViewpointEditDialog({
  viewpoint,
  onUpdated,
  onCancel,
  onUpdate,
}: TestViewpointEditDialogProps) {
  const [title, setTitle] = useState(viewpoint.title);
  const [description, setDescription] = useState(viewpoint.description ?? '');
  const [technique, setTechnique] = useState<TestTechnique | ''>(viewpoint.technique ?? '');
  const [priority, setPriority] = useState<Priority | ''>(viewpoint.priority ?? '');
  const [automationSuitability, setAutomationSuitability] = useState<AutomationSuitability | ''>(
    viewpoint.automationSuitability ?? '',
  );
  const [automationReason, setAutomationReason] = useState(viewpoint.automationReason ?? '');
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
      await onUpdate(viewpoint.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        technique: technique || undefined,
        priority: priority || undefined,
        automationSuitability: automationSuitability || undefined,
        automationReason: automationReason.trim() || undefined,
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
            <h3 className="dialog-title">テスト観点を編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="vp-edit-title">
                タイトル <span className="label-optional">(必須)</span>
              </label>
              <input
                id="vp-edit-title"
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="vp-edit-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="vp-edit-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="vp-edit-technique">
                  テスト技法
                </label>
                <select
                  id="vp-edit-technique"
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
                <label className="label" htmlFor="vp-edit-priority">
                  優先度
                </label>
                <select
                  id="vp-edit-priority"
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
                <label className="label" htmlFor="vp-edit-automation">
                  自動化適性
                </label>
                <select
                  id="vp-edit-automation"
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
                <label className="label" htmlFor="vp-edit-auto-reason">
                  自動化理由 <span className="label-optional">(任意)</span>
                </label>
                <input
                  id="vp-edit-auto-reason"
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
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
