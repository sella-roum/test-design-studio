import { useState } from 'react';
type UiNodeCreateDialogProps = {
  parentNode: { id?: string; name?: string } | null;
  onCreated: (nodeId: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    projectId: string;
    name: string;
    parentId?: string;
    role?: string;
    componentType?: string;
    description?: string;
    selectorHint?: string;
    textHint?: string;
  }) => Promise<{ id: string }>;
  projectId: string;
};

const ROLE_OPTIONS = [
  { value: '', label: '-- 未選択 --' },
  { value: 'button', label: 'button' },
  { value: 'textbox', label: 'textbox' },
  { value: 'link', label: 'link' },
  { value: 'heading', label: 'heading' },
  { value: 'checkbox', label: 'checkbox' },
  { value: 'combobox', label: 'combobox' },
  { value: 'listbox', label: 'listbox' },
  { value: 'radio', label: 'radio' },
  { value: 'table', label: 'table' },
  { value: 'dialog', label: 'dialog' },
  { value: 'img', label: 'img' },
  { value: 'text', label: 'text' },
  { value: 'timer', label: 'timer' },
  { value: 'progressbar', label: 'progressbar' },
  { value: 'other', label: 'other' },
];

export function UiNodeCreateDialog({
  parentNode,
  onCreated,
  onCancel,
  onCreate,
  projectId,
}: UiNodeCreateDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [componentType, setComponentType] = useState('');
  const [description, setDescription] = useState('');
  const [selectorHint, setSelectorHint] = useState('');
  const [textHint, setTextHint] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('UI要素名は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const node = await onCreate({
        projectId,
        name: name.trim(),
        parentId: parentNode?.id || undefined,
        role: role || undefined,
        componentType: componentType.trim() || undefined,
        description: description.trim() || undefined,
        selectorHint: selectorHint.trim() || undefined,
        textHint: textHint.trim() || undefined,
      });
      onCreated(node.id);
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
            <h3 className="dialog-title">
              UI要素を追加
              {parentNode?.name && (
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: 'var(--fs-body)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  （配下: {parentNode.name}）
                </span>
              )}
            </h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="uinode-name">
                UI要素名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="uinode-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 検索入力欄"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="uinode-role">
                Role <span className="label-optional">(任意)</span>
              </label>
              <select
                id="uinode-role"
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="uinode-component">
                コンポーネント種別 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="uinode-component"
                className="input"
                type="text"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                placeholder="例: input, select, table, modal"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="uinode-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="uinode-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このUI要素の役割"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="uinode-selector">
                Selector候補 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="uinode-selector"
                className="input"
                type="text"
                value={selectorHint}
                onChange={(e) => setSelectorHint(e.target.value)}
                placeholder="例: #search-input, [data-testid='search']"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="uinode-texthint">
                表示テキスト候補 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="uinode-texthint"
                className="input"
                type="text"
                value={textHint}
                onChange={(e) => setTextHint(e.target.value)}
                placeholder="例: 検索、ログイン"
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
