import { useState } from 'react';
import type { Feature } from '../../lib/models/feature';
import type { Priority, Confidence } from '../../lib/types';

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: 'confirmed', label: '確定' },
  { value: 'tentative', label: '仮確定' },
  { value: 'assumed', label: '想定' },
  { value: 'unknown', label: '未判断' },
];

type FeatureEditDialogProps = {
  feature: Feature;
  onUpdated: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      description?: string;
      purpose?: string;
      actor?: string;
      preconditions?: string;
      successCriteria?: string;
      failureConditions?: string;
      priority?: Priority;
      riskLevel?: Priority;
      confidence?: Confidence;
    },
  ) => Promise<void>;
};

export function FeatureEditDialog({
  feature,
  onUpdated,
  onCancel,
  onUpdate,
}: FeatureEditDialogProps) {
  const [name, setName] = useState(feature.name);
  const [description, setDescription] = useState(feature.description ?? '');
  const [purpose, setPurpose] = useState(feature.purpose ?? '');
  const [actor, setActor] = useState(feature.actor ?? '');
  const [preconditions, setPreconditions] = useState(feature.preconditions ?? '');
  const [successCriteria, setSuccessCriteria] = useState(feature.successCriteria ?? '');
  const [failureConditions, setFailureConditions] = useState(feature.failureConditions ?? '');
  const [priority, setPriority] = useState<Priority | ''>(feature.priority ?? '');
  const [riskLevel, setRiskLevel] = useState<Priority | ''>(feature.riskLevel ?? '');
  const [confidence, setConfidence] = useState<Confidence | ''>(feature.confidence ?? '');
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
      await onUpdate(feature.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        purpose: purpose.trim() || undefined,
        actor: actor.trim() || undefined,
        preconditions: preconditions.trim() || undefined,
        successCriteria: successCriteria.trim() || undefined,
        failureConditions: failureConditions.trim() || undefined,
        priority: priority || undefined,
        riskLevel: riskLevel || undefined,
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
            <h3 className="dialog-title">機能を編集</h3>
            <button type="button" className="dialog-close" onClick={onCancel}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-name">
                機能名 <span className="label-optional">(必須)</span>
              </label>
              <input
                id="edit-feature-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-desc">
                説明 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-feature-desc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-purpose">
                目的 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-feature-purpose"
                className="input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="この機能の目的"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-actor">
                主利用者 <span className="label-optional">(任意)</span>
              </label>
              <input
                id="edit-feature-actor"
                className="input"
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="例: 一般ユーザー、管理者"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-preconditions">
                前提条件 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-feature-preconditions"
                className="input"
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-success">
                成功条件 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-feature-success"
                className="input"
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-failure">
                失敗条件 <span className="label-optional">(任意)</span>
              </label>
              <textarea
                id="edit-feature-failure"
                className="input"
                value={failureConditions}
                onChange={(e) => setFailureConditions(e.target.value)}
              />
            </div>
            <div className="grid-2col" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="label" htmlFor="edit-feature-priority">
                  優先度 <span className="label-optional">(任意)</span>
                </label>
                <select
                  id="edit-feature-priority"
                  className="select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority | '')}
                >
                  <option value="">-- 未選択 --</option>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="edit-feature-risk">
                  リスク <span className="label-optional">(任意)</span>
                </label>
                <select
                  id="edit-feature-risk"
                  className="select"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as Priority | '')}
                >
                  <option value="">-- 未選択 --</option>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="edit-feature-confidence">
                確度 <span className="label-optional">(任意)</span>
              </label>
              <select
                id="edit-feature-confidence"
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
