import { useState } from 'react';

type ProjectCreateDialogProps = {
  onCreated: (projectId: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    name: string;
    description?: string;
    targetAppName?: string;
    targetAppUrl?: string;
  }) => Promise<{ id: string }>;
};

export function ProjectCreateDialog({ onCreated, onCancel, onCreate }: ProjectCreateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAppName, setTargetAppName] = useState('');
  const [targetAppUrl, setTargetAppUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('プロジェクト名は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const project = await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        targetAppName: targetAppName.trim() || undefined,
        targetAppUrl: targetAppUrl.trim() || undefined,
      });
      onCreated(project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="dialog-header">
            <h3 className="dialog-title">新規プロジェクト</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="project-name">
                プロジェクト名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="project-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: AILEAD Web App"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="project-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="project-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="プロジェクトの概要"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="project-app-name">
                対象アプリ名 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="project-app-name"
                className="input"
                type="text"
                value={targetAppName}
                onChange={(e) => setTargetAppName(e.target.value)}
                placeholder="例: AILEAD"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="project-app-url">
                対象アプリURL <span className="label-optional">(任意)</span>
              </label>
              <input
                id="project-app-url"
                className="input"
                type="url"
                value={targetAppUrl}
                onChange={(e) => setTargetAppUrl(e.target.value)}
                placeholder="例: https://example.com"
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
