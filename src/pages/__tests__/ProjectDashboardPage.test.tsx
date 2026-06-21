import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../components/common/Toast';
import { ProjectDashboardPage } from '../ProjectDashboardPage';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';

function renderWithRouter(projectId: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDashboardPage />} />
          <Route path="/projects" element={<div>Project List Page</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ProjectDashboardPage', () => {
  let existingProjectId: string;

  beforeEach(async () => {
    await db.projects.clear();
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Existing Dashboard' });
    existingProjectId = project.id;
  });

  it('shows loading state initially', () => {
    renderWithRouter('some-id');
    expect(screen.getByText('プロジェクトダッシュボード')).toBeInTheDocument();
  });

  it('displays project info when project exists', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({
      name: 'Test Dashboard',
      description: 'A test project',
      targetAppName: 'TestApp',
      targetAppUrl: 'https://test.example.com',
    });

    renderWithRouter(project.id);

    await waitFor(() => {
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText('TestApp')).toBeInTheDocument();
    expect(screen.getByText('https://test.example.com')).toBeInTheDocument();
  });

  it('shows project not found for non-existent project', async () => {
    renderWithRouter('non-existent-id');

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });
  });

  it('shows project not found for removed project', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Gone' });
    await repo.markRemoved(project.id);

    renderWithRouter(project.id);

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });
  });

  it('recovers from not-found state when navigating to existing project', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Recovery Test' });

    renderWithRouter(project.id);

    await waitFor(() => {
      expect(screen.getByText('Recovery Test')).toBeInTheDocument();
    });
  });

  it('shows not found for missing-id then displays existing project on same page', async () => {
    renderWithRouter('missing-id');

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });

    renderWithRouter(existingProjectId);

    await waitFor(() => {
      expect(screen.getByText('Existing Dashboard')).toBeInTheDocument();
    });
  });

  it('has a link back to project list', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'With Back Link' });

    renderWithRouter(project.id);

    await waitFor(() => {
      expect(screen.getByText('With Back Link')).toBeInTheDocument();
    });

    const backLinks = screen.getAllByText('プロジェクト一覧');
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
  });
});
