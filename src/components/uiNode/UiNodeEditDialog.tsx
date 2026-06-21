import { useState } from 'react';
import type { UiNode } from '../../lib/models/uiNode';

type UiNodeEditDialogProps = {
  node: UiNode;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      role?: string;
      componentType?: string;
      description?: string;
      selectorHint?: string;
      textHint?: string;
    },
  ) => Promise<void>;
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

export function UiNodeEditDialog({ node, onUpdated, onCancel, onUpdate }: UiNodeEditDialogProps) {
  const [name, setName] = useState(node.name);
  const [role, setRole] = useState(node.role ?? '');
  const [componentType, setComponentType] = useState(node.componentType ?? '');
  const [description, setDescription] = useState(node.description ?? '');
  const [selectorHint, setSelectorHint] = useState(node.selectorHint ?? '');
  const [textHint, setTextHint] = useState(node.textHint ?? '');
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
      await onUpdate(node.id, {
        name: name.trim(),
        role: role || undefined,
        componentType: componentType.trim() || undefined,
        description: description.trim() || undefined,
        selectorHint: selectorHint.trim() || undefined,
        textHint: textHint.trim() || undefined,
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
            <h3 className="dialog-title">UI要素を編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="edit-uinode-name">
                UI要素名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="edit-uinode-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-uinode-role">
                Role <span className="label-optional">(任意)</span>
              </label>
              <select
                id="edit-uinode-role"
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
              <label className="label" htmlFor="edit-uinode-component">
                コンポーネント種別 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-uinode-component"
                className="input"
                type="text"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-uinode-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-uinode-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-uinode-selector">
                Selector候補 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-uinode-selector"
                className="input"
                type="text"
                value={selectorHint}
                onChange={(e) => setSelectorHint(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-uinode-texthint">
                表示テキスト候補 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-uinode-texthint"
                className="input"
                type="text"
                value={textHint}
                onChange={(e) => setTextHint(e.target.value)}
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
