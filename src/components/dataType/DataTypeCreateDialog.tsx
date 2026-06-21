import { useState } from 'react';
import type { BaseType } from '../../lib/models/dataType';

const BASE_TYPE_OPTIONS: { value: BaseType; label: string }[] = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'enum', label: 'enum' },
  { value: 'object', label: 'object' },
];

type DataTypeCreateDialogProps = {
  onCreated: (id: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    name: string;
    baseType: BaseType;
    description?: string;
  }) => Promise<{ id: string }>;
};

export function DataTypeCreateDialog({ onCreated, onCancel, onCreate }: DataTypeCreateDialogProps) {
  const [name, setName] = useState('');
  const [baseType, setBaseType] = useState<BaseType>('string');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('データ型名は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dt = await onCreate({
        name: name.trim(),
        baseType,
        description: description.trim() || undefined,
      });
      onCreated(dt.id);
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
            <h3 className="dialog-title">新規データ型</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="dt-name">
                データ型名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="dt-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: email, date, amount"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="dt-basetype">
                基本型 <span className="label-optional">(必須)</span>
              </label>
              <select
                id="dt-basetype"
                className="select"
                value={baseType}
                onChange={(e) => setBaseType(e.target.value as BaseType)}
              >
                {BASE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="dt-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="dt-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
