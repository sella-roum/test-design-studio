import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { createProjectRepository } from '../lib/repositories/projectRepository';
import { useFeatures } from '../hooks/useFeatures';
import { useScreens } from '../hooks/useScreens';
import { useToast } from '../components/common/ToastContext';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { FeatureTable } from '../components/feature/FeatureTable';
import { FeatureCreateDialog } from '../components/feature/FeatureCreateDialog';
import { FeatureEditDialog } from '../components/feature/FeatureEditDialog';
import { ScreenTable } from '../components/screen/ScreenTable';
import { ScreenCreateDialog } from '../components/screen/ScreenCreateDialog';
import { ScreenEditDialog } from '../components/screen/ScreenEditDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { Project } from '../lib/models/project';
import type { Feature } from '../lib/models/feature';
import type { Screen } from '../lib/models/screen';

const projectRepo = createProjectRepository(db);

export function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectNotFound, setProjectNotFound] = useState(false);

  const {
    features,
    loading: featuresLoading,
    create: createFeature,
    update: updateFeature,
    markRemoved: removeFeature,
  } = useFeatures(projectId ?? '');
  const {
    screens,
    loading: screensLoading,
    create: createScreen,
    update: updateScreen,
    markRemoved: removeScreen,
  } = useScreens(projectId ?? '');

  const [showCreateFeature, setShowCreateFeature] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [removingFeature, setRemovingFeature] = useState<Feature | null>(null);

  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [removingScreen, setRemovingScreen] = useState<Screen | null>(null);

  useEffect(() => {
    if (!projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectNotFound(true);
      setProjectLoading(false);
      return;
    }
    setProjectLoading(true);
    setProject(null);
    setProjectNotFound(false);
    let cancelled = false;
    projectRepo
      .get(projectId)
      .then((p) => {
        if (cancelled) return;
        if (!p || p.status === 'removed') {
          setProjectNotFound(true);
        } else {
          setProject(p);
        }
      })
      .catch(() => {
        if (!cancelled) setProjectNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleCreateFeature = async (input: { name: string; description?: string }) => {
    const feature = await createFeature(input);
    toast.toast('success', '機能を作成しました');
    return feature;
  };

  const handleUpdateFeature = async (id: string, patch: Parameters<typeof updateFeature>[1]) => {
    await updateFeature(id, patch);
    setEditingFeature(null);
    toast.toast('success', '機能を更新しました');
  };

  const handleRemoveFeature = async () => {
    if (!removingFeature) return;
    try {
      await removeFeature(removingFeature.id);
      toast.toast('success', '機能を削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : '削除に失敗しました');
    } finally {
      setRemovingFeature(null);
    }
  };

  const handleCreateScreen = async (input: Parameters<typeof createScreen>[0]) => {
    const screen = await createScreen(input);
    toast.toast('success', '画面を作成しました');
    return screen;
  };

  const handleUpdateScreen = async (id: string, patch: Parameters<typeof updateScreen>[1]) => {
    await updateScreen(id, patch);
    setEditingScreen(null);
    toast.toast('success', '画面を更新しました');
  };

  const handleRemoveScreen = async () => {
    if (!removingScreen) return;
    try {
      await removeScreen(removingScreen.id);
      toast.toast('success', '画面を削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : '削除に失敗しました');
    } finally {
      setRemovingScreen(null);
    }
  };

  const isLoading = projectLoading || featuresLoading || screensLoading;

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">プロジェクトダッシュボード</h1>
        </div>
        <div className="kpi-cards">
          {[1, 2, 3, 4].map((i) => (
            <div className="card" key={i}>
              <div className="skeleton" style={{ height: 28, marginBottom: 8, width: '40%' }} />
              <div className="skeleton" style={{ height: 14, width: '60%' }} />
            </div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 40, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 40 }} />
      </div>
    );
  }

  if (projectNotFound || !project) {
    return (
      <div className="error-page">
        <h1>プロジェクトが見つかりません</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          指定されたプロジェクトは存在しないか、削除されました。
        </p>
        <Link to="/projects" className="btn btn-primary">
          プロジェクト一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-description">{project.description}</p>}
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateFeature(true)}>
            新規機能
          </button>
          <button className="btn btn-secondary" onClick={() => setShowCreateScreen(true)}>
            新規画面
          </button>
          <Link to="/projects" className="btn btn-ghost">
            プロジェクト一覧
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          marginBottom: 'var(--layout-section-gap)',
          fontSize: 'var(--fs-caption)',
          color: 'var(--color-text-muted)',
        }}
      >
        <Badge variant={project.status} />
        <span>対象アプリ: {project.targetAppName || '-'}</span>
        {project.targetAppUrl && (
          <a
            href={project.targetAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {project.targetAppUrl}
          </a>
        )}
        <span>更新日時: {new Date(project.updatedAt).toLocaleString('ja-JP')}</span>
      </div>

      <div className="kpi-cards">
        <div className="card kpi-card">
          <p className="kpi-number">{features.length}</p>
          <p className="kpi-label">機能</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">{screens.length}</p>
          <p className="kpi-label">画面</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">0</p>
          <p className="kpi-label">テスト観点 / テストケース</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">0</p>
          <p className="kpi-label">未確認事項</p>
        </div>
      </div>

      {features.length === 0 ? (
        <EmptyState
          title="まだ機能がありません"
          description="このProjectで最初に設計したい機能を作成しましょう。Feature Workspaceで画面、UI要素、業務ルール、観点、ケースを整理できます。"
          action={
            <button className="btn btn-primary" onClick={() => setShowCreateFeature(true)}>
              機能を作成
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h3
              style={{
                fontSize: 'var(--fs-section-title)',
                margin: '0 0 12px',
                fontWeight: 600,
              }}
            >
              機能一覧
            </h3>
            <FeatureTable
              features={features}
              screens={screens}
              onSelect={(id) => navigate(`/projects/${projectId}/features/${id}`)}
              onEdit={setEditingFeature}
              onRemove={setRemovingFeature}
            />
          </div>

          {screens.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 'var(--fs-section-title)',
                  margin: '0 0 12px',
                  fontWeight: 600,
                }}
              >
                画面一覧
              </h3>
              <ScreenTable
                screens={screens}
                onEdit={setEditingScreen}
                onRemove={setRemovingScreen}
              />
            </div>
          )}
        </div>
      )}

      {showCreateFeature && (
        <FeatureCreateDialog
          onCreate={handleCreateFeature}
          onCreated={(id) => {
            setShowCreateFeature(false);
            navigate(`/projects/${projectId}/features/${id}`);
          }}
          onCancel={() => setShowCreateFeature(false)}
        />
      )}

      {editingFeature && (
        <FeatureEditDialog
          feature={editingFeature}
          onUpdate={handleUpdateFeature}
          onUpdated={() => setEditingFeature(null)}
          onCancel={() => setEditingFeature(null)}
        />
      )}

      {removingFeature && (
        <ConfirmDialog
          title="機能を削除"
          message={`「${removingFeature.name}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveFeature}
          onCancel={() => setRemovingFeature(null)}
        />
      )}

      {showCreateScreen && (
        <ScreenCreateDialog
          features={features}
          onCreate={handleCreateScreen}
          onCreated={() => {
            setShowCreateScreen(false);
            toast.toast('success', '画面を作成しました');
          }}
          onCancel={() => setShowCreateScreen(false)}
        />
      )}

      {editingScreen && (
        <ScreenEditDialog
          screen={editingScreen}
          onUpdate={handleUpdateScreen}
          onUpdated={() => setEditingScreen(null)}
          onCancel={() => setEditingScreen(null)}
        />
      )}

      {removingScreen && (
        <ConfirmDialog
          title="画面を削除"
          message={`「${removingScreen.name}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveScreen}
          onCancel={() => setRemovingScreen(null)}
        />
      )}
    </div>
  );
}
