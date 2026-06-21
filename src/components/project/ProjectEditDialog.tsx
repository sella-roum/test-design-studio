import { useState } from 'react';

type ProjectEditDialogProps = {
  project: {
    id: string;
    name: string;
    description?: string;
    targetAppName?: string;
    targetAppUrl?: string;
  };
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: { name?: string; description?: string; targetAppName?: string; targetAppUrl?: string },
  ) => Promise<void>;
};

export function ProjectEditDialog({
  project,
  onUpdated,
  onCancel,
  onUpdate,
}: ProjectEditDialogProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [targetAppName, setTargetAppName] = useState(project.targetAppName ?? '');
  const [targetAppUrl, setTargetAppUrl] = useState(project.targetAppUrl ?? '');
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
      await onUpdate(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        targetAppName: targetAppName.trim() || undefined,
        targetAppUrl: targetAppUrl.trim() || undefined,
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
            <h3 className="dialog-title">プロジェクトを編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="edit-project-name">
                プロジェクト名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="edit-project-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-project-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-project-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-project-app-name">
                対象アプリ名 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-project-app-name"
                className="input"
                type="text"
                value={targetAppName}
                onChange={(e) => setTargetAppName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-project-app-url">
                対象アプリURL <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-project-app-url"
                className="input"
                type="url"
                value={targetAppUrl}
                onChange={(e) => setTargetAppUrl(e.target.value)}
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
