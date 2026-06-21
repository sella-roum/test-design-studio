import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ProjectTable } from '../components/project/ProjectTable';
import { ProjectCreateDialog } from '../components/project/ProjectCreateDialog';
import { ProjectEditDialog } from '../components/project/ProjectEditDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/ToastContext';
import type { Project } from '../lib/models/project';

export function ProjectListPage() {
  const { projects, loading, error, create, update, markRemoved, reload } = useProjects();
  const navigate = useNavigate();
  const toast = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [removingProject, setRemovingProject] = useState<Project | null>(null);

  const handleSelect = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleCreate = async (input: {
    name: string;
    description?: string;
    targetAppName?: string;
    targetAppUrl?: string;
  }) => {
    const project = await create(input);
    toast.toast('success', 'プロジェクトを作成しました');
    return project;
  };

  const handleUpdate = async (
    id: string,
    patch: { name?: string; description?: string; targetAppName?: string; targetAppUrl?: string },
  ) => {
    await update(id, patch);
    setEditingProject(null);
    toast.toast('success', 'プロジェクトを更新しました');
  };

  const handleRemove = async () => {
    if (!removingProject) return;
    try {
      await markRemoved(removingProject.id);
      toast.toast('success', 'プロジェクトを削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : '削除に失敗しました');
    } finally {
      setRemovingProject(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">プロジェクト</h1>
        </div>
        <div className="card">
          <div className="skeleton" style={{ height: 40, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 40, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">プロジェクト</h1>
        </div>
        <div className="error-page">
          <h2>読み込みに失敗しました</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" onClick={reload}>
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">プロジェクト</h1>
          <p className="page-description">テスト設計プロジェクトの一覧</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            新規プロジェクト
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="まだプロジェクトがありません"
          description="最初のテスト設計プロジェクトを作成して、機能・画面・テスト観点・テストケースを整理しましょう。"
          action={
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              プロジェクトを作成
            </button>
          }
        />
      ) : (
        <ProjectTable
          projects={projects}
          onSelect={handleSelect}
          onEdit={setEditingProject}
          onRemove={setRemovingProject}
        />
      )}

      {showCreate && (
        <ProjectCreateDialog
          onCreate={handleCreate}
          onCreated={(id) => {
            setShowCreate(false);
            navigate(`/projects/${id}`);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editingProject && (
        <ProjectEditDialog
          project={editingProject}
          onUpdate={handleUpdate}
          onUpdated={() => setEditingProject(null)}
          onCancel={() => setEditingProject(null)}
        />
      )}

      {removingProject && (
        <ConfirmDialog
          title="プロジェクトを削除"
          message={`「${removingProject.name}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemove}
          onCancel={() => setRemovingProject(null)}
        />
      )}
    </div>
  );
}
