import { useState } from 'react';
import type { BusinessRule, BusinessRuleType } from '../../lib/models/businessRule';

const RULE_TYPE_OPTIONS: { value: BusinessRuleType; label: string }[] = [
  { value: 'validation', label: 'validation' },
  { value: 'permission', label: 'permission' },
  { value: 'display', label: 'display' },
  { value: 'calculation', label: 'calculation' },
  { value: 'workflow', label: 'workflow' },
  { value: 'error', label: 'error' },
  { value: 'exception', label: 'exception' },
  { value: 'other', label: 'other' },
];

type BusinessRuleEditDialogProps = {
  businessRule: BusinessRule;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      description?: string;
      ruleType?: BusinessRuleType;
    },
  ) => Promise<BusinessRule>;
};

export function BusinessRuleEditDialog({
  businessRule,
  onUpdated,
  onCancel,
  onUpdate,
}: BusinessRuleEditDialogProps) {
  const [name, setName] = useState(businessRule.name);
  const [description, setDescription] = useState(businessRule.description);
  const [ruleType, setRuleType] = useState<BusinessRuleType>(businessRule.ruleType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ルール名は必須です');
      return;
    }
    if (!description.trim()) {
      setError('ルール内容は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onUpdate(businessRule.id, {
        name: name.trim(),
        description: description.trim(),
        ruleType,
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
            <h3 className="dialog-title">業務ルールを編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="br-edit-name">
                ルール名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="br-edit-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="br-edit-type">
                ルール種別 <span className="label-optional">(必須)</span>
              </label>
              <select
                id="br-edit-type"
                className="select"
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as BusinessRuleType)}
              >
                {RULE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="br-edit-desc">
                ルール内容 <span className="label-optional">(必須)</span>
              </label>
              <textarea
                id="br-edit-desc"
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
