import { useState } from 'react';
import type { ScreenType } from '../../lib/models/screen';
import type { Feature } from '../../lib/models/feature';
import { SCREEN_TYPE_OPTIONS } from './screenTypeOptions';

type ScreenCreateDialogProps = {
  features: Feature[];
  onCreated: (screenId: string) => void;
  onCancel: () => void;
  onCreate: (input: {
    featureId: string;
    name: string;
    screenType?: ScreenType;
    urlPattern?: string;
    purpose?: string;
    preconditions?: string;
    description?: string;
  }) => Promise<{ id: string }>;
};

export function ScreenCreateDialog({
  features,
  onCreated,
  onCancel,
  onCreate,
}: ScreenCreateDialogProps) {
  const [featureId, setFeatureId] = useState(features.length > 0 ? features[0].id : '');
  const [name, setName] = useState('');
  const [screenType, setScreenType] = useState<ScreenType | ''>('');
  const [purpose, setPurpose] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('画面名は必須です');
      return;
    }
    if (!featureId) {
      setError('関連機能を選択してください');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const screen = await onCreate({
        featureId,
        name: name.trim(),
        screenType: screenType || undefined,
        purpose: purpose.trim() || undefined,
        preconditions: preconditions.trim() || undefined,
      });
      onCreated(screen.id);
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
            <h3 className="dialog-title">新規画面</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="screen-feature">
                関連機能 <span className="label-optional">(必須)</span>
              </label>
              <select
                id="screen-feature"
                className="select"
                value={featureId}
                onChange={(e) => setFeatureId(e.target.value)}
              >
                {features.length === 0 && <option value="">-- 機能がありません --</option>}
                {features.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="screen-name">
                画面名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="screen-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: ログイン画面"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="screen-type">
                画面種別 <span className="label-optional">(任意)</span>
              </label>
              <select
                id="screen-type"
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
              <label className="label" htmlFor="screen-purpose">
                目的 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="screen-purpose"
                className="input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="この画面の目的"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="screen-preconditions">
                表示前提 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="screen-preconditions"
                className="input"
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
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
