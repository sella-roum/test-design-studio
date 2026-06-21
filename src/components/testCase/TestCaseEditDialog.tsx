import { useState } from 'react';
import { StepTable, type StepRow } from './StepTable';
import type { TestCase } from '../../lib/models/testCase';
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

type TestCaseEditDialogProps = {
  testCase: TestCase;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      title?: string;
      viewpointId?: string;
      preconditions?: string;
      steps?: StepRow[];
      priority?: Priority;
      automationSuitability?: AutomationSuitability;
      automationReason?: string;
    },
  ) => Promise<TestCase>;
  viewpointOptions?: { id: string; title: string }[];
};

export function TestCaseEditDialog({
  testCase,
  onUpdated,
  onCancel,
  onUpdate,
  viewpointOptions,
}: TestCaseEditDialogProps) {
  const [title, setTitle] = useState(testCase.title);
  const [viewpointId, setViewpointId] = useState(testCase.viewpointId ?? '');
  const [preconditions, setPreconditions] = useState(testCase.preconditions ?? '');
  const [steps, setSteps] = useState<StepRow[]>(() =>
    testCase.steps.map((s, i) => ({
      id: s.id ?? `step_existing_${testCase.id}_${i}`,
      action: s.action,
      instruction: s.instruction,
      targetUiNodeId: s.targetUiNodeId,
      expectedResult: s.expectedResult,
      testData: s.testData,
    })),
  );
  const [priority, setPriority] = useState<Priority | ''>(testCase.priority ?? '');
  const [automationSuitability, setAutomationSuitability] = useState<AutomationSuitability | ''>(
    testCase.automationSuitability ?? '',
  );
  const [automationReason, setAutomationReason] = useState(testCase.automationReason ?? '');
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
      await onUpdate(testCase.id, {
        title: title.trim(),
        viewpointId: viewpointId || undefined,
        preconditions: preconditions.trim() || undefined,
        steps,
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
      <div className="dialog dialog-wide" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="dialog-header">
            <h3 className="dialog-title">テストケースを編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="tc-edit-title">
                タイトル <span className="label-optional">(必須)</span>
              </label>
              <input
                id="tc-edit-title"
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            {viewpointOptions && viewpointOptions.length > 0 && (
              <div className="form-group">
                <label className="label" htmlFor="tc-edit-viewpoint">
                  テスト観点 <span className="label-optional">(任意)</span>
                </label>
                <select
                  id="tc-edit-viewpoint"
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
              <label className="label" htmlFor="tc-edit-preconditions">
                前提条件 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="tc-edit-preconditions"
                className="input"
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
              />
            </div>
            <div className="form-group">
              <StepTable steps={steps} onChange={setSteps} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="tc-edit-priority">
                  優先度
                </label>
                <select
                  id="tc-edit-priority"
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
                <label className="label" htmlFor="tc-edit-automation">
                  自動化適性
                </label>
                <select
                  id="tc-edit-automation"
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
              <label className="label" htmlFor="tc-edit-auto-reason">
                自動化理由 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="tc-edit-auto-reason"
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
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
