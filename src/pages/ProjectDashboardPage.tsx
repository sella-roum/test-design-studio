import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { createProjectRepository } from '../lib/repositories/projectRepository';
import type { Project } from '../lib/models/project';
import { Badge } from '../components/common/Badge';

const repo = createProjectRepository(db);

export function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    repo
      .get(projectId)
      .then((p) => {
        if (cancelled) return;
        if (!p || p.status === 'removed') {
          setNotFound(true);
        } else {
          setProject(p);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">プロジェクトダッシュボード</h1>
        </div>
        <div className="card">
          <div className="skeleton" style={{ height: 24, marginBottom: 12, width: '60%' }} />
          <div className="skeleton" style={{ height: 16, marginBottom: 12, width: '40%' }} />
          <div className="skeleton" style={{ height: 16, width: '80%' }} />
        </div>
      </div>
    );
  }

  if (notFound || !project) {
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
          <Link to="/projects" className="btn btn-secondary">
            プロジェクト一覧
          </Link>
        </div>
      </div>

      <div className="grid-2col">
        <div className="card">
          <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-section-title)' }}>
            プロジェクト情報
          </h3>
          <table className="table">
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, width: 140 }}>状態</td>
                <td>
                  <Badge variant={project.status} />
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>対象アプリ名</td>
                <td>{project.targetAppName || '-'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>対象アプリURL</td>
                <td>
                  {project.targetAppUrl ? (
                    <a href={project.targetAppUrl} target="_blank" rel="noopener noreferrer">
                      {project.targetAppUrl}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>更新日時</td>
                <td style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(project.updatedAt).toLocaleString('ja-JP')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-section-title)' }}>設計状況</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            機能・画面・テスト観点・テストケースの管理は
            <strong> TASK-012 </strong>
            で追加予定です。
          </p>
          <Link
            to="/projects"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 8, display: 'inline-flex' }}
          >
            プロジェクト一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
