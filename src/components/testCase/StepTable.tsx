import type { TestStepAction } from '../../lib/models/testCase';

const ACTION_OPTIONS: { value: TestStepAction; label: string }[] = [
  { value: 'navigate', label: '遷移' },
  { value: 'click', label: 'クリック' },
  { value: 'fill', label: '入力' },
  { value: 'select', label: '選択' },
  { value: 'check', label: '確認' },
  { value: 'assert', label: '検証' },
  { value: 'wait', label: '待機' },
  { value: 'other', label: 'その他' },
];

export type StepRow = {
  id: string;
  action: TestStepAction;
  instruction: string;
  targetUiNodeId?: string;
  expectedResult?: string;
  testData?: string;
};

type StepTableProps = {
  steps: StepRow[];
  onChange: (steps: StepRow[]) => void;
};

let stepIdCounter = Date.now();

function newStepId(): string {
  return `step_${stepIdCounter++}`;
}

function createEmptyStep(): StepRow {
  return { id: newStepId(), action: 'other', instruction: '' };
}

export function StepTable({ steps, onChange }: StepTableProps) {
  const updateStep = (index: number, patch: Partial<StepRow>) => {
    const next = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const addStep = () => {
    onChange([...steps, createEmptyStep()]);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index >= steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div className="step-table">
      <div className="step-table-header">
        <span className="label">テストステップ</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addStep}>
          + ステップ追加
        </button>
      </div>
      {steps.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '8px 0' }}>
          ステップがありません。「+ ステップ追加」ボタンで追加してください。
        </p>
      ) : (
        <table className="table step-table-inner">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th style={{ width: 100 }}>操作</th>
              <th>手順</th>
              <th>期待結果</th>
              <th>テストデータ</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, i) => (
              <tr key={step.id}>
                <td style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>{i + 1}</td>
                <td>
                  <select
                    className="select select-sm"
                    value={step.action}
                    onChange={(e) => updateStep(i, { action: e.target.value as TestStepAction })}
                  >
                    {ACTION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="input input-sm"
                    type="text"
                    value={step.instruction}
                    onChange={(e) => updateStep(i, { instruction: e.target.value })}
                    placeholder="操作内容"
                  />
                </td>
                <td>
                  <input
                    className="input input-sm"
                    type="text"
                    value={step.expectedResult ?? ''}
                    onChange={(e) => updateStep(i, { expectedResult: e.target.value || undefined })}
                    placeholder="期待結果（任意）"
                  />
                </td>
                <td>
                  <input
                    className="input input-sm"
                    type="text"
                    value={step.testData ?? ''}
                    onChange={(e) => updateStep(i, { testData: e.target.value || undefined })}
                    placeholder="テストデータ（任意）"
                  />
                </td>
                <td className="actions" style={{ whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    aria-label="上に移動"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => moveDown(i)}
                    disabled={i === steps.length - 1}
                    aria-label="下に移動"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => removeStep(i)}
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
