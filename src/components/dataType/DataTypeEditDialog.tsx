import { useState } from 'react';
import type { DataType, BaseType } from '../../lib/models/dataType';

const BASE_TYPE_OPTIONS: { value: BaseType; label: string }[] = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'enum', label: 'enum' },
  { value: 'object', label: 'object' },
];

type DataTypeEditDialogProps = {
  dataType: DataType;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      baseType?: BaseType;
      description?: string;
    },
  ) => Promise<DataType>;
};

export function DataTypeEditDialog({
  dataType,
  onUpdated,
  onCancel,
  onUpdate,
}: DataTypeEditDialogProps) {
  const [name, setName] = useState(dataType.name);
  const [baseType, setBaseType] = useState<BaseType>(dataType.baseType);
  const [description, setDescription] = useState(dataType.description ?? '');
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
      await onUpdate(dataType.id, {
        name: name.trim(),
        baseType,
        description: description.trim() || undefined,
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
            <h3 className="dialog-title">データ型を編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="dt-edit-name">
                データ型名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="dt-edit-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="dt-edit-basetype">
                基本型 <span className="label-optional">(必須)</span>
              </label>
              <select
                id="dt-edit-basetype"
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
              <label className="label" htmlFor="dt-edit-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="dt-edit-desc"
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
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
