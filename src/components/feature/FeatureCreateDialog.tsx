import { useState } from 'react';

type FeatureCreateDialogProps = {
  onCreated: (featureId: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    name: string;
    description?: string;
    purpose?: string;
    actor?: string;
    preconditions?: string;
    successCriteria?: string;
    failureConditions?: string;
  }) => Promise<{ id: string }>;
};

export function FeatureCreateDialog({ onCreated, onCancel, onCreate }: FeatureCreateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('機能名は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const feature = await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated(feature.id);
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
            <h3 className="dialog-title">新規機能</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="feature-name">
                機能名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="feature-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: ログイン認証"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="feature-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="feature-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="機能の概要"
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
