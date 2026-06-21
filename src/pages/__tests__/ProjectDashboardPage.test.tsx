import { act, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from '../../components/common/Toast';
import { ProjectDashboardPage } from '../ProjectDashboardPage';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';

function renderWithMemoryRouter(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/projects/:projectId',
        element: <ProjectDashboardPage />,
      },
      {
        path: '/projects',
        element: <div>Project List Page</div>,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  );

  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );

  return router;
}

describe('ProjectDashboardPage', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it('shows loading state initially', () => {
    renderWithMemoryRouter('/projects/some-id');
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

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText(/対象アプリ:\s*TestApp/)).toBeInTheDocument();
    expect(screen.getByText('https://test.example.com')).toBeInTheDocument();
    expect(screen.queryByText('プロジェクトが見つかりません')).not.toBeInTheDocument();
  });

  it('shows project not found for non-existent project', async () => {
    renderWithMemoryRouter('/projects/non-existent-id');

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });
  });

  it('shows project not found for removed project', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Gone' });
    await repo.markRemoved(project.id);

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });
  });

  it('recovers from not-found state when navigating to existing project on the same router', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Recovered Project' });

    const router = renderWithMemoryRouter('/projects/missing-id');

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });

    await act(async () => {
      await router.navigate(`/projects/${project.id}`);
    });

    await waitFor(() => {
      expect(screen.getByText('Recovered Project')).toBeInTheDocument();
    });
    expect(screen.queryByText('プロジェクトが見つかりません')).not.toBeInTheDocument();
  });

  it('has a link back to project list', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'With Back Link' });

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('With Back Link')).toBeInTheDocument();
    });

    const backLinks = screen.getAllByText('プロジェクト一覧');
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
  });
});
