import { useState } from 'react';
import type { Screen, ScreenType } from '../../lib/models/screen';
import type { Confidence } from '../../lib/types';
import { SCREEN_TYPE_OPTIONS } from './screenTypeOptions';

const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: 'confirmed', label: '確定' },
  { value: 'tentative', label: '仮確定' },
  { value: 'assumed', label: '想定' },
  { value: 'unknown', label: '未判断' },
];

type ScreenEditDialogProps = {
  screen: Screen;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      screenType?: ScreenType;
      urlPattern?: string;
      purpose?: string;
      preconditions?: string;
      description?: string;
      confidence?: Confidence;
    },
  ) => Promise<void>;
};

export function ScreenEditDialog({ screen, onUpdated, onCancel, onUpdate }: ScreenEditDialogProps) {
  const [name, setName] = useState(screen.name);
  const [screenType, setScreenType] = useState<ScreenType | ''>(screen.screenType ?? '');
  const [urlPattern, setUrlPattern] = useState(screen.urlPattern ?? '');
  const [purpose, setPurpose] = useState(screen.purpose ?? '');
  const [preconditions, setPreconditions] = useState(screen.preconditions ?? '');
  const [description, setDescription] = useState(screen.description ?? '');
  const [confidence, setConfidence] = useState<Confidence | ''>(screen.confidence ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('画面名は必須です');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onUpdate(screen.id, {
        name: name.trim(),
        screenType: screenType || undefined,
        urlPattern: urlPattern.trim() || undefined,
        purpose: purpose.trim() || undefined,
        preconditions: preconditions.trim() || undefined,
        description: description.trim() || undefined,
        confidence: confidence || undefined,
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
            <h3 className="dialog-title">画面を編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-name">
                画面名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="edit-screen-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-type">
                画面種別 <span className="label-optional">(任意)</span>
              </label>
              <select
                id="edit-screen-type"
                className="select"
                value={screenType}
                onChange={(e) => setScreenType(e.target.value as ScreenType | '')}
              >
                <option value="">-- 未選択 --</option>
                {SCREEN_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-url">
                URLパターン <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-screen-url"
                className="input"
                type="text"
                value={urlPattern}
                onChange={(e) => setUrlPattern(e.target.value)}
                placeholder="例: /login"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-purpose">
                目的 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-screen-purpose"
                className="input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-preconditions">
                表示前提 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-screen-preconditions"
                className="input"
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-screen-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-screen-confidence">
                確度 <span className="label-optional">(任意)</span>
              </label>
              <select
                id="edit-screen-confidence"
                className="select"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as Confidence | '')}
              >
                <option value="">-- 未選択 --</option>
                {CONFIDENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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
